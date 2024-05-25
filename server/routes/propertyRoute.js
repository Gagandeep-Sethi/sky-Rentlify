const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  addProperty,
  deleteProperty,
  updateProperty,
  getProperties,
} = require("../controllers/propertyController");

router.post("/addNewProperty", requireAuth, addProperty);
router.post("/deleteProperty/:id", requireAuth, deleteProperty);
router.post("/updateProperty/:id", requireAuth, updateProperty);
router.get("/all", getProperties);

module.exports = router;
