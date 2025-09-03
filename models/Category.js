import mongoose from "mongoose";
import Counter from "./Counter.js";
import slugify from "slugify";

const categorySchema = new mongoose.Schema({
  categoryId: { type: String, unique: true },
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, trim: true },
}, { timestamps: true });

categorySchema.pre("save", async function(next) {
  if (!this.categoryId) {
    const counter = await Counter.findOneAndUpdate(
      { id: "categoryId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.categoryId = `C${String(counter.seq).padStart(3, "0")}`;
  }
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export default mongoose.model("Category", categorySchema);
