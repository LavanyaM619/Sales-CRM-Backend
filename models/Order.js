import mongoose from "mongoose";
import Counter from "./Counter.js"; // make sure you have a Counter model

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    geo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderId = `O${String(counter.seq).padStart(3, "0")}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

export default mongoose.model("Order", orderSchema);
