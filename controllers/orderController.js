import Order from "../models/Order.js";
import Category from "../models/Category.js";
import { stringify } from "csv-stringify/sync";

// Build Mongo filter from query
const buildFilter = async (q) => {
  const filter = {};

  // Search
  if (q.search) {
    const regex = new RegExp(q.search, "i"); // case-insensitive
    filter.$or = [
      { customer: regex },
      { source: regex },
      { geo: regex },
    ];
  }

  // Date filter
  if (q.startDate || q.endDate) {
    filter.date = {};
    if (q.startDate) filter.date.$gte = new Date(q.startDate);
    if (q.endDate)   filter.date.$lte = new Date(q.endDate);
  }

  // Source & Geo
  if (q.source) filter.source = { $in: q.source.split(",") };
  if (q.geo)    filter.geo = { $in: q.geo.split(",") };

  // Category filter
  if (q.category) {
    const parts = q.category.split(",");
    const byId = parts.filter(p => p.match(/^[0-9a-fA-F]{24}$/));
    const byName = parts.filter(p => !p.match(/^[0-9a-fA-F]{24}$/));
    const ids = [...byId];
    if (byName.length) {
      const found = await Category.find({ name: { $in: byName } }).select("_id");
      ids.push(...found.map(f => f._id.toString()));
    }
    filter.category = { $in: ids };
  }

  return filter;
};

// Create Order
export const createOrder = async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
};

// Get All Orders with pagination + filters
export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));

    const filter = await buildFilter(req.query);
    const total = await Order.countDocuments(filter);

    const data = await Order.find(filter)
      .populate("category", "name slug categoryId")
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalPages = Math.ceil(total / pageSize);

    res.json({
      data,
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("category", "name slug categoryId");
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
};

// Update order
export const updateOrder = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
};

// Delete order
export const deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
};

// Mark as viewed
export const markOrderViewed = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { $set: { viewedAt: new Date() } }, { new: true });
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
};

export const exportOrdersCsv = async (req, res) => {
  try {
    const filter = await buildFilter(req.query); // use current filters
    const orders = await Order.find(filter)
      .populate("category", "name")
      .sort({ date: -1 })
      .lean();

    // Convert data to CSV
    const csv = stringify(
      orders.map((o) => ({
        OrderID: o.orderId,
        Customer: o.customer,
        Category: o.category?.name || "",
        Date: o.date.toISOString().slice(0, 10),
        Source: o.source,
        Geo: o.geo,
        Amount: o.amount,
      })),
      { header: true }
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="orders.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

