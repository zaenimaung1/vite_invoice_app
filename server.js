import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const DB_PATH = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());

async function readDb() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw || "{}");
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.products || []);
  } catch (e) {
    res.status(500).json({ error: "Failed to read products" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const db = await readDb();
    const products = db.products || [];
    const id = Number(req.params.id);
    const product = products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: "Failed to read product" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const db = await readDb();
    const products = db.products || [];
    const body = req.body || {};
    const maxId = products.reduce((m, p) => (p.id > m ? p.id : m), 0);
    const id = body.id != null ? body.id : maxId + 1;
    const created_at = body.created_at || new Date().toISOString();
    const newProduct = {
      id,
      name: body.name,
      price: body.price,
      created_at,
    };
    products.push(newProduct);
    db.products = products;
    await writeDb(db);
    res.status(201).json(newProduct);
  } catch (e) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const db = await readDb();
    const products = db.products || [];
    const id = Number(req.params.id);
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Product not found" });
    }
    const body = req.body || {};
    products[idx] = {
      ...products[idx],
      name: body.name,
      price: body.price,
      created_at: body.created_at || products[idx].created_at,
    };
    db.products = products;
    await writeDb(db);
    res.json(products[idx]);
  } catch (e) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const db = await readDb();
    const products = db.products || [];
    const id = Number(req.params.id);
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) {
      return res.status(404).json({ error: "Product not found" });
    }
    db.products = filtered;
    await writeDb(db);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});
// VOUCHERS
app.get("/vouchers", async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.vouchers || []);
  } catch (e) {
    res.status(500).json({ error: "Failed to read vouchers" });
  }
});

app.post("/vouchers", async (req, res) => {
  try {
    const db = await readDb();
    const vouchers = db.vouchers || [];
    const body = req.body || {};
    // ensure unique numeric id
    const maxId = vouchers.reduce((m, v) => (v.id > m ? v.id : m), 0);
    const id = body.id != null ? body.id : maxId + 1;
    const newVoucher = { ...body, id };
    vouchers.push(newVoucher);
    db.vouchers = vouchers;
    await writeDb(db);
    res.status(201).json(newVoucher);
  } catch (e) {
    res.status(500).json({ error: "Failed to create voucher" });
  }
});

app.patch("/vouchers/:id", async (req, res) => {
  try {
    const db = await readDb();
    const vouchers = db.vouchers || [];
    const id = Number(req.params.id);
    const idx = vouchers.findIndex((v) => v.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    vouchers[idx] = { ...vouchers[idx], ...req.body };
    db.vouchers = vouchers;
    await writeDb(db);
    res.json(vouchers[idx]);
  } catch (e) {
    res.status(500).json({ error: "Failed to update voucher" });
  }
});

app.delete("/vouchers/:id", async (req, res) => {
  try {
    const db = await readDb();
    const vouchers = db.vouchers || [];
    const id = Number(req.params.id);
    const filtered = vouchers.filter((v) => v.id !== id);
    if (filtered.length === vouchers.length) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    db.vouchers = filtered;
    await writeDb(db);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete voucher" });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});

