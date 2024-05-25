const { generateJwtToken } = require("../helpers/tokenGeneration");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const validator = require("validator");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    //checking if any of the field is empty
    if (!email || !password) {
      throw new Error("All fields must be field");
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    //checking if user exists in databse or not
    if (!user) {
      throw new Error("Invalid username or password");
    }
    //check if password providd by user matches password saved in db
    const passwordCheck = await bcrypt.compare(password, user.password || "");
    if (!passwordCheck) {
      throw new Error("Invalid username or password");
    }
    //generating jwt for auth purposes
    generateJwtToken(user?._id, res);
    res
      .status(200)
      .json({
        email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phoneNumber: user?.phoneNumber,
      });
  } catch (error) {
    console.log(error, "sigup error");
    if (error instanceof Error) {
      res.status(400).json({ mesage: error.message });
    } else {
      res.status(500).json({ message: "server error" });
    }
  }
};
exports.signup = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, phoneNumber } =
    req.body;
  try {
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !email
    ) {
      throw new Error("All Fields must be filled");
    }

    if (!validator.isEmail(email)) {
      throw new Error("Email not valid");
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error("Not a strong password");
    }
    if (password !== confirmPassword) {
      throw new Error("confirm Password doesn't match");
    }
    //checks if ita an indian no
    if (!validator.isMobilePhone(phoneNumber, "en-IN")) {
      throw new Error("Phone number invalid");
    }
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      //user try to to signup when user already exist
      throw new Error("Already a user please login !!");
    }

    //encrpt. password usinf bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      firstName,
      lastName,
      phoneNumber,
      email: email.toLowerCase(),
      password: hashPassword,
    });

    res.status(200).json({
      email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ mesage: error.message });
    } else {
      res.status(500).json({ message: "server error" });
    }
  }
};
exports.logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out Successful" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal server error" });
  }
};
