import dotenv from "dotenv-safe";
dotenv.config();
import mongoose from "mongoose";
import { connectToDatabase } from "../db.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";

await connectToDatabase();

const catNames = ["Electronics","Apparel","Home"];
const cats = {};
for (const name of catNames) {
  const c = await Category.findOneAndUpdate({ name }, { name }, { upsert: true, new: true, setDefaultsOnInsert: true });
  cats[name] = c._id;
}

const sample = [
  { customer: "Alice Smith", category: cats["Electronics"], date: "2025-09-01", source: "Online", geo: "New York", amount: 1299 },
  { customer: "Bob Johnson", category: cats["Apparel"],     date: "2025-09-02", source: "Store",  geo: "Los Angeles", amount: 89 },
  { customer: "Carlos Perez", category: cats["Electronics"], date: "2025-09-03", source: "Online", geo: "Miami", amount: 299 },
  { customer: "Diana Wu",     category: cats["Home"],        date: "2025-09-03", source: "Partner",geo: "Seattle", amount: 159 },
  { customer: "Ethan Brown",  category: cats["Electronics"], date: "2025-09-04", source: "Online", geo: "Chicago", amount: 699 },
];

await Order.insertMany(sample.map(o => ({ ...o, date: new Date(o.date) })));
console.log("Seeded orders:", sample.length);
await mongoose.disconnect();
process.exit(0);
