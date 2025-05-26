import express from "express";
import cors from "cors";
import * as lancedb from "@lancedb/lancedb";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 8888;

// Get current file's directory (works in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration - resolve path relative to this file
const DB_PATH = path.resolve(__dirname, "../data/lancedb");
// Middleware
app.use(cors());
app.use(express.json());

/**
 * Get all entries from the LanceDB
 */
async function getAllEntries() {
  try {
    const db = await lancedb.connect(DB_PATH);
    console.log("db.tableNames()", await db.tableNames());

    const table = await db.openTable("docs");
    if (table.countRows() === 0) {
      throw new Error("No data in table: ", table.name);
    }

    const arrowTable = await table.toArrow();

    console.log(
      "Table details:  ",
      await table.display(),
      await table.countRows()
      // await arrowTable.numRows()
    );

    const results = await table.query().limit(150).toArray();
    console.log("rows fetched: ", results.length);
    return results;
  } catch (error) {
    const message = "Error reading from LanceDB: " + error.message;
    throw new Error(message);
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/api/docs", async (req, res) => {
  try {
    const data = await getAllEntries();
    res.json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch documents",
    });
  }
});

app.get("/api/docs/count", async (req, res) => {
  try {
    const data = await getAllEntries();
    res.json({
      success: true,
      count: data.length,
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LanceDB API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Docs endpoint: http://localhost:${PORT}/api/docs`);
});
