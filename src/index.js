import { connect, Index, Table } from "@lancedb/lancedb";
import { loadAndSplitDoc } from "./pipeline/01_loadSplitEmbed.js";
import { loadDocsFromDirectory } from "./pipeline/01A_loadFromDirectory.js";
import { storeEntries } from "./pipeline/02_store.js";
import { storeEntriesFromJson } from "./pipeline/02A_storeEntriesFromJson.js";
import { embedQueryAndRetrieve } from "./pipeline/03_queryDb.js";

import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Load Data
  // const entries = await loadAndSplitDoc();
  // await loadDocsFromDirectory();

  // Add data to vector store
  // await storeEntries(entries);
  await storeEntriesFromJson();

  // Query and retrieve
  // await embedQueryAndRetrieve();
}

main().catch(console.error);
