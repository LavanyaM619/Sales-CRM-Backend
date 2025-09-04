import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Counter from "./Counter.js";

export const roles = ["admin", "user"]; // add "manager" here if you need it

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: { type: String, required: [true, "First name is required"], trim: true, minlength: 2 },
  lastname: { type: String, required: [true, "Last name is required"], trim: true, minlength: 2 },
  email: {
    type: String, required: true, unique: true, trim: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: roles, default: "user" }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  // assign userId once
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "userId" }, { $inc: { seq: 1 } }, { new: true, upsert: true }
    );
    this.userId = `U${String(counter.seq).padStart(3, "0")}`;
  }
  // (re)hash when password changed
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
