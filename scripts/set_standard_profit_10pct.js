import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vocherapp";
const DB_NAME = process.env.DB_NAME || "vocherapp";

const roundMMK = (value) => Math.round(value);

const run = async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const productsCol = db.collection("products");

    const products = await productsCol.find().toArray();
    if (!products.length) {
      console.log("No products found.");
      return;
    }

    const ops = products.map((p) => {
      const price = Number(p.price) || 0;
      const standardProfit = roundMMK(price * 0.1);
      return {
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { standardProfit } },
        },
      };
    });

    const result = await productsCol.bulkWrite(ops);
    console.log(
      `Updated ${result.modifiedCount} products (10% standardProfit).`
    );
  } finally {
    await client.close();
  }
};

run().catch((err) => {
  console.error("Failed to update products:", err);
  process.exit(1);
});
