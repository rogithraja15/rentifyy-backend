import express from "express";
import bcryptjs from "bcryptjs";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";
import { formatError, formatResponse } from "../utils/response.js";
const authRouter = express.Router();

// Sign Up
authRouter.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, email, password, tag, phonenumber } = req.body;

    if (
      !firstname ||
      !lastname ||
      !phonenumber ||
      !email ||
      !password ||
      !tag
    ) {
      return res.status(400).json(formatError("All fields are required"));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(formatError("User with same email already exists!"));
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      phonenumber,
      tag,
    });
    user = await user.save();

    const token = jwt.sign({ id: user._id, userType: user.tag }, "passwordKey");

    res.status(200).json(formatResponse(token, "Success"));
  } catch (e) {
    res.status(500).json(formatError(e.message));
  }
});

// Sign In

authRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json(formatError("User with this email does not exist!"));
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(formatError("Incorrect password."));
    }

    const token = jwt.sign({ id: user._id, userType: user.tag }, "passwordKey");

    res.status(200).json(formatResponse(token, "Success"));
  } catch (e) {
    res.status(500).json(formatError(e.message));
  }
});

authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

export { authRouter };
