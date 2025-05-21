import { connect, Index, Table } from "@lancedb/lancedb";
import { loadAndSplitDoc } from "./steps/01_loadSplit.js";

import dotenv from "dotenv";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";

dotenv.config();

const db = await connect("./data/lancedb");

async function main() {
  await loadAndSplitDoc();
}

main().catch(console.error);
