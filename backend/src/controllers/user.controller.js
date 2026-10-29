import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Please enter username and password" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = crypto.randomBytes(20).toString("hex");

      user.token = token;
      await user.save();

      return res.status(httpStatus.OK).json({ token: token });
    }

    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Invalid password" });
  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e.message}` });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(httpStatus.CREATED).json({ message: "User registered" });
  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e.message}` });
  }
};

const addToActivity = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    if (!token || !meeting_code) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Token and meeting code are required",
      });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid token",
      });
    }

    user.history.push({
      meetingCode: meeting_code,
      date: new Date(),
    });

    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Meeting history saved",
    });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong: ${e.message}`,
    });
  }
};

const getAllActivity = async (req, res) => {
  const token = req.query.token;

  try {
    if (!token) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Token is required",
      });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid token",
      });
    }

    return res.status(httpStatus.OK).json(user.history || []);
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong: ${e.message}`,
    });
  }
};

export { login, register, addToActivity, getAllActivity };
