import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, lastname, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ name, lastname, email, password, role });

    const token = jwt.sign(
      { id: user._id, userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user and update lastLogin
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const seedAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL; // admin@gmail.com
    const adminPassword = process.env.ADMIN_PASSWORD; // admin123

    if (!adminEmail || !adminPassword) return;

    const existingAdmin = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (!existingAdmin) {
      // Create admin if not exists
      await User.create({
        name: "Admin",
        lastname: "User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin", // lowercase to match enum
      });
      console.log("Admin user created:", adminEmail);
    } else {
      // Update password if admin exists
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log("Admin password updated:", adminEmail);
    }
  } catch (error) {
    console.error("Failed to seed/update admin user:", error);
  }
};

