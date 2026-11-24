const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const router = express.Router();
const ALLOWED_ROLES = new Set(["admin", "instructor", "student"]);

router.post("/register", async (req, res, next) => {
  const { fullName, email, password, role = "student" } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "fullName, email, and password are required"
    });
  }

  if (!ALLOWED_ROLES.has(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role"
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role
    });

    return res.status(201).json({
      success: true,
      user: {
        id: String(user._id),
        full_name: user.fullName,
        email: user.email,
        role: user.role,
        created_at: user.createdAt
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "email and password are required"
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role
      },
      env.jwtSecret,
      {
        subject: String(user._id),
        expiresIn: env.jwtExpiresIn
      }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
