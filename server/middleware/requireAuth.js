const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; //getting a cookie from req name jwt
    if (!token) {
      res.status(401).json({ message: "unauthorised token not found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //verifying token
    if (!decoded) {
      res.status(401).json({ message: "unauthorised invalid token" });
    }
    const user = await User.findById(decoded._id).select("-password"); //extracting _id part from the token which was encoded in it
    if (!user) {
      res.status(400).json({ message: "user not found" });
    }
    console.log(user, "user");
    req.user = user; //we are attaching user property to req and passing it on to next middleware of main function and we can use that tha user property as we know now the user is authenticated
    next();
  } catch (error) {
    console.log("error in require auth ", error);
    res.status(500).json({ message: "Request not authorized" });
  }
};
module.exports = requireAuth;
