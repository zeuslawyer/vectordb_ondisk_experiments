import { connect, Index, Table } from "@lancedb/lancedb";
import { loadAndSplitDoc } from "./steps/01_loadSplitEmbed.js";
import { loadDocsFromDirectory } from "./steps/01A_loadFromDirectory.js";
import { storeEntries } from "./steps/02_store.js";
import { storeEntriesFromJson } from "./steps/02A_storeEntriesFromJson.js";
import { readDB } from "./steps/03_queryDb.js";

import dotenv from "dotenv";

dotenv.config();

async function main() {
  // const entries = await loadAndSplitDoc();
  // await loadDocsFromDirectory();

  // await storeEntries(entries);
  await storeEntriesFromJson();
  await readDB();
}

main().catch(console.error);
