// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { MongoClient } from "mongodb";
import multer from "multer";
import * as xlsx from "xlsx";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const DB_PATH = path.join(__dirname, "data.json");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vocherapp";
const DB_NAME = process.env.DB_NAME || "vocherapp";

let client;
let db;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ------------------- MongoDB -------------------
async function getDb() {
  if (db) return db;

  client = new MongoClient(MONGODB_URI);
  await client.connect();

  db = client.db(DB_NAME);

  await Promise.all([
    db.collection("products").createIndex({ id: 1 }, { unique: true }),
    db.collection("vouchers").createIndex({ id: 1 }, { unique: true }),
  ]);

  console.log("Connected to MongoDB");
  return db;
}

async function getNextId(collection) {
  const last = await collection.find().sort({ id: -1 }).limit(1).next();
  return last?.id ? Number(last.id) + 1 : 1;
}

async function loadSeedData() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw || "{}");
}

// Seed data if DB is empty
async function seedIfEmpty() {
  const database = await getDb();
  const [productsCount, vouchersCount] = await Promise.all([
    database.collection("products").estimatedDocumentCount(),
    database.collection("vouchers").estimatedDocumentCount(),
  ]);

  if (productsCount === 0 && vouchersCount === 0) {
    const seed = await loadSeedData();
    const products = Array.isArray(seed.products) ? seed.products : [];
    const vouchers = Array.isArray(seed.vouchers) ? seed.vouchers : [];

    if (products.length) {
      await database.collection("products").insertMany(
        products.map((p) => ({ ...p, id: Number(p.id) }))
      );
    }
    if (vouchers.length) {
      await database.collection("vouchers").insertMany(
        vouchers.map((v) => ({ ...v, id: Number(v.id) }))
      );
    }

    console.log("Seeded MongoDB from data.json");
  }
}

// ------------------- Validation -------------------
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validateProductPayload(body) {
  if (!isNonEmptyString(body?.name)) return "Product name is required";
  if (!isNumber(body?.price)) return "Product price must be a number";
  if (body?.id != null && !isNumber(body.id)) return "Product id must be a number";
  return null;
}

function validateVoucherPayload(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body?.username != null) {
    if (!isNonEmptyString(body?.username)) errors.push("username is required");
  }
  if (!partial || body?.phoneNumber != null) {
    if (!isNonEmptyString(body?.phoneNumber)) errors.push("phoneNumber is required");
  }
  if (!partial || body?.voucherId != null) {
    if (!isNonEmptyString(body?.voucherId)) errors.push("voucherId is required");
  }
  if (!partial || body?.date != null) {
    if (!isNonEmptyString(body?.date)) errors.push("date is required");
  }
  if (!partial || body?.items != null) {
    if (!Array.isArray(body?.items)) errors.push("items must be an array");
  }
  if (!partial || body?.subTotal != null) {
    if (!isNumber(body?.subTotal)) errors.push("subTotal must be a number");
  }
  if (!partial || body?.tax != null) {
    if (!isNumber(body?.tax)) errors.push("tax must be a number");
  }
  if (body?.taxRate != null && !isNumber(body.taxRate)) {
    errors.push("taxRate must be a number");
  }
  if (!partial || body?.grandTotal != null) {
    if (!isNumber(body?.grandTotal)) errors.push("grandTotal must be a number");
  }
  if (body?.id != null && !isNumber(body.id)) errors.push("id must be a number");

  return errors.length ? errors.join(", ") : null;
}

// ------------------- PRODUCTS CRUD -------------------
app.get("/products", async (req, res) => {
  try {
    const database = await getDb();
    const products = await database.collection("products").find().sort({ id: 1 }).toArray();
    res.json(products);
  } catch {
    res.status(500).json({ error: "Failed to read products" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const database = await getDb();
    const product = await database.collection("products").findOne({ id });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Failed to read product" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const database = await getDb();
    const productsCol = database.collection("products");
    const body = req.body || {};
    const error = validateProductPayload(body);
    if (error) return res.status(400).json({ error });
    const id = body.id != null ? Number(body.id) : await getNextId(productsCol);
    const created_at = body.created_at || new Date().toISOString();
    const newProduct = { id, name: body.name, price: body.price, created_at };
    await productsCol.insertOne(newProduct);
    res.status(201).json(newProduct);
  } catch {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const database = await getDb();
    const productsCol = database.collection("products");
    const existing = await productsCol.findOne({ id });
    if (!existing) return res.status(404).json({ error: "Product not found" });
    const body = req.body || {};
    const error = validateProductPayload(body);
    if (error) return res.status(400).json({ error });
    const updated = { ...existing, name: body.name, price: body.price, created_at: body.created_at || existing.created_at };
    await productsCol.updateOne({ id }, { $set: updated });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const database = await getDb();
    const result = await database.collection("products").deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Product not found" });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ------------------- VOUCHERS CRUD -------------------
app.get("/vouchers", async (req, res) => {
  try {
    const database = await getDb();
    const vouchers = await database.collection("vouchers").find().sort({ id: 1 }).toArray();
    res.json(vouchers);
  } catch {
    res.status(500).json({ error: "Failed to read vouchers" });
  }
});

app.post("/vouchers", async (req, res) => {
  try {
    const database = await getDb();
    const vouchersCol = database.collection("vouchers");
    const body = req.body || {};
    const error = validateVoucherPayload(body);
    if (error) return res.status(400).json({ error });
    const id = body.id != null ? Number(body.id) : await getNextId(vouchersCol);
    const newVoucher = { ...body, id };
    await vouchersCol.insertOne(newVoucher);
    res.status(201).json(newVoucher);
  } catch {
    res.status(500).json({ error: "Failed to create voucher" });
  }
});

app.patch("/vouchers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const database = await getDb();
    const vouchersCol = database.collection("vouchers");
    const existing = await vouchersCol.findOne({ id });
    if (!existing) return res.status(404).json({ error: "Voucher not found" });
    const error = validateVoucherPayload(req.body || {}, { partial: true });
    if (error) return res.status(400).json({ error });
    const updated = { ...existing, ...req.body, id };
    await vouchersCol.updateOne({ id }, { $set: updated });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update voucher" });
  }
});

app.delete("/vouchers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const database = await getDb();
    const result = await database.collection("vouchers").deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Voucher not found" });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Failed to delete voucher" });
  }
});

// ------------------- VOUCHER EXCEL IMPORT -------------------
app.post("/vouchers/import-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Excel file is required" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer", cellDates: true });
    const sheetName = req.body?.sheet || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return res.status(400).json({ error: "Sheet not found in Excel file" });
    }

    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: null });
    if (!rows.length) {
      return res.status(400).json({ error: "Excel sheet is empty" });
    }

    const database = await getDb();
    const vouchersCol = database.collection("vouchers");
    const productsCol = database.collection("products");
    let nextId = await getNextId(vouchersCol);
    const usedIds = new Set();
    const errors = [];
    const parsedRows = [];
    const productIdSet = new Set();

    rows.forEach((row, index) => {
      const excelRow = index + 2;
      let id = Number(row.id);
      if (!Number.isFinite(id)) id = null;
      if (id == null || usedIds.has(id)) {
        id = nextId;
        nextId += 1;
      }
      usedIds.add(id);

      let items = row.items;
      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch {
          errors.push({ row: excelRow, error: "items is not valid JSON" });
          return;
        }
      }
      if (!Array.isArray(items)) items = [];

      let dateValue = row.date;
      if (dateValue instanceof Date) {
        dateValue = dateValue.toISOString();
      }
      const subTotal = isNumber(row.subTotal) ? row.subTotal : Number(row.subTotal);
      const tax = isNumber(row.tax) ? row.tax : Number(row.tax);
      const grandTotal = isNumber(row.grandTotal)
        ? row.grandTotal
        : Number(row.grandTotal);
      let taxRate = row.taxRate;
      if (taxRate == null && isNumber(tax) && isNumber(subTotal)) {
        taxRate = subTotal === 0 ? 0 : tax / subTotal;
      }

      const voucher = {
        id,
        voucherId: row.voucherId ?? row.voucher_id ?? row.voucherID,
        username: row.username,
        phoneNumber: row.phoneNumber,
        date: dateValue,
        items,
        subTotal: Number.isFinite(subTotal) ? subTotal : row.subTotal,
        tax: Number.isFinite(tax) ? tax : row.tax,
        taxRate: taxRate ?? 0,
        grandTotal: Number.isFinite(grandTotal) ? grandTotal : row.grandTotal,
      };

      const error = validateVoucherPayload(voucher);
      if (error) {
        errors.push({ row: excelRow, error });
        return;
      }

      for (const item of items) {
        const pid = item?.product?.id ?? item?.productId ?? item?.product_id;
        if (Number.isFinite(Number(pid))) {
          productIdSet.add(Number(pid));
        }
      }

      parsedRows.push({ excelRow, voucher });
    });

    if (errors.length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const productIds = Array.from(productIdSet);
    const productMap = new Map();
    if (productIds.length) {
      const products = await productsCol.find({ id: { $in: productIds } }).toArray();
      products.forEach((p) => productMap.set(Number(p.id), p));
    }

    const ops = parsedRows.map(({ voucher }) => {
      const enrichedItems = (voucher.items || []).map((item) => {
        const pid = item?.product?.id ?? item?.productId ?? item?.product_id;
        const product = productMap.get(Number(pid));
        if (!product) return item;
        const existing = item.product || {};
        return {
          ...item,
          product: {
            ...existing,
            _id: product._id,
            id: product.id,
            name: product.name,
            price: product.price,
            created_at: product.created_at,
          },
        };
      });

      return {
        updateOne: {
          filter: { id: voucher.id },
          update: { $set: { ...voucher, items: enrichedItems } },
          upsert: true,
        },
      };
    });

    const result = ops.length
      ? await vouchersCol.bulkWrite(ops)
      : { upsertedCount: 0, modifiedCount: 0 };

    res.json({ message: "Imported vouchers", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to import Excel", details: err?.message });
  }
});

// ------------------- START SERVER -------------------
getDb()
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
