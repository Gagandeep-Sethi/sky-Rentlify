const {
  uploadImagesToCloudinary,
  deleteImages,
} = require("../helpers/cloudinary");
const Property = require("../models/Property");
const User = require("../models/User");

exports.addProperty = async (req, res) => {
  try {
    console.log("addreached");
    const requestingUserId = req.user._id;
    const user = await User.findById(requestingUserId);
    if (!user) {
      throw new Error("User not found");
    }

    const {
      place,
      area,
      bedrooms,
      bathrooms,
      hospitalNearby,
      collegeNearby,
      description,
      price,
      availableFrom,
    } = req.body;
    console.log(req.body, "body");

    // Check for non-empty values
    const requiredFields = {
      place,
      area,
      bedrooms,
      bathrooms,
      hospitalNearby,
      collegeNearby,
      description,
      price,
      availableFrom,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.log(key, "is abscent");
        throw new Error(`${key} is required and cannot be empty`);
      }
    }

    // Get images from req.files
    const images = req.files && req.files.images; // Assuming you're using a middleware like express-fileupload

    if (!images) {
      throw new Error("At least one image is required");
    }

    let uploadedImages = [];
    if (images.length > 0) {
      // If images is a single file, wrap it in an array
      const imageFiles = Array.isArray(images) ? images : [images];
      uploadedImages = await uploadImagesToCloudinary(
        imageFiles,
        "rentlify/properties"
      );
    }

    const property = await Property.create({
      place,
      area,
      bedrooms,
      bathrooms,
      hospitalNearby,
      collegeNearby,
      description,
      price,
      availableFrom,
      images: uploadedImages,
      userId: requestingUserId,
    });

    await property.save();
    res.status(200).json(property);
  } catch (error) {
    console.error("Error adding property:", error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};
exports.deleteProperty = async (req, res) => {
  try {
    const requestingUserId = req.user._id;
    const propertyId = req.params.id;

    // Check if the property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    // Check if the user is the owner of the property
    if (property.userId.toString() !== requestingUserId.toString()) {
      throw new Error("You do not have permission to delete this property");
    }

    // Delete all images associated with the property
    if (property.images && property.images.length > 0) {
      await deleteImages(property.images);
    }

    // Delete the property from the database
    await property.deleteOne();

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};
exports.updateProperty = async (req, res) => {
  try {
    const requestingUserId = req.user._id;
    const propertyId = req.params.id;

    // Check if the property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the user is the owner of the property

    if (property.userId.toString() !== requestingUserId.toString()) {
      return res.status(403).json({
        message: "You do not have permission to update this property",
      });
    }

    const {
      place,
      area,
      bedrooms,
      bathrooms,
      hospitalNearby,
      collegeNearby,
      description,
      price,
      availableFrom,
      deletedImages, // Array of public IDs to be deleted
    } = req.body;

    // Update the property details with the new values if provided
    const updatedDetails = {
      place,
      area,
      bedrooms,
      bathrooms,
      hospitalNearby,
      collegeNearby,
      description,
      price,
      availableFrom,
    };

    for (const [key, value] of Object.entries(updatedDetails)) {
      if (value !== undefined) {
        property[key] = value;
      }
    }
    console.log(deletedImages, "images");
    // Delete specified images from Cloudinary and remove their file paths from the property’s images array
    if (deletedImages && deletedImages.length > 0) {
      await deleteImages(deletedImages);
      property.images = property.images.filter(
        (image) => !deletedImages.includes(image)
      );
    }

    // Handle new image uploads
    const newImages = req.files && req.files.newImages;
    if (newImages) {
      const newImageFiles = Array.isArray(newImages) ? newImages : [newImages];
      const uploadedImages = await uploadImagesToCloudinary(
        newImageFiles,
        "rentlify/properties"
      );
      property.images = property.images.concat(uploadedImages);
    }

    // Save the updated property
    await property.save();
    res.status(200).json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};
