import jwt from "jsonwebtoken";
import User, { roles } from "../models/User.js";

const sign = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  try {
    const { name, lastname, email, password, role = "user" } = req.body;
    if (!roles.includes(role)) return res.status(400).json({ message: "Invalid role" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const user = await User.create({ name, lastname, email, password, role });
    res.status(201).json({ token: sign(user), user: { id: user._id, email: user.email, role: user.role } });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({ token: sign(user), user: { id: user._id, email: user.email, role: user.role } });
};

export const getAllUsers = async (_req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const seedAdminUser = async (_req, res) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return res.status(500).json?.({ message: "ADMIN_EMAIL/ADMIN_PASSWORD missing" });

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ name: "Admin", lastname: "User", email, password, role: "admin" });
  }
  return res?.json ? res.json({ ok: true }) : null;
};
