const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // secure: process.env.NODE_ENV !== "development",
});

const uploadImageToCloudinary = (file, folder) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    // secure: process.env.NODE_ENV !== "development",
  });
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: folder, resource_type: "image" },
        (error, result) => {
          if (error) {
            return reject(error);
          } else {
            return resolve(result.public_id);
          }
        }
      )
      .end(file.data);
  });
};

const uploadImagesToCloudinary = async (files, folder) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    // secure: process.env.NODE_ENV !== "development",
  });
  const uploadPromises = files.map((file) =>
    uploadImageToCloudinary(file, folder)
  );
  const results = await Promise.all(uploadPromises);
  return results; // Array of public IDs
};

const deleteImage = async (publicId) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    // secure: process.env.NODE_ENV !== "development",
  });
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result; // Return the result for further handling if needed
  } catch (error) {
    throw error; // Re-throw the error to be handled by the calling function
  }
};

const deleteImages = async (publicIds) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    // secure: process.env.NODE_ENV !== "development",
  });
  if (!Array.isArray(publicIds)) {
    publicIds = [publicIds];
  }

  try {
    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results; // Return the results for further handling if needed
  } catch (error) {
    throw error; // Re-throw the error to be handled by the calling function
  }
};

module.exports = {
  uploadImageToCloudinary,
  uploadImagesToCloudinary,
  deleteImage,
  deleteImages,
};
