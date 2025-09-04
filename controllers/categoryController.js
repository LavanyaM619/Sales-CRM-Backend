import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json(cat);
};
export const getAllCategories = async (_req, res) => {
  const cats = await Category.find().sort({ createdAt: -1 });
  res.json(cats);
};
export const getCategoryById = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: "Not found" });
  res.json(cat);
};
export const updateCategory = async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!cat) return res.status(404).json({ message: "Not found" });
  res.json(cat);
};
export const deleteCategory = async (req, res) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
};
