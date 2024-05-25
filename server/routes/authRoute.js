const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", requireAuth, logout);

module.exports = router;
