import { connect, Index, Table } from "@lancedb/lancedb";
import { loadAndSplitDoc } from "./pipeline/01_loadSplitEmbed.js";
import { loadDocsFromDirectory } from "./pipeline/01A_loadFromDirectory.js";
import { storeEntries } from "./pipeline/02_store.js";
import { storeEntriesFromJson } from "./pipeline/02A_storeEntriesFromJson.js";
import { addToDbFromJSON } from "./pipeline/02B_addEntriesFromJson.js";
import { embedQueryAndRetrieve } from "./pipeline/03_queryDbAndRetrieve.js";

import dotenv from "dotenv";

dotenv.config();

async function main() {
  // (1) Load Data - pick one
  // const entries = await loadAndSplitDoc();
  // await loadDocsFromDirectory();

  // (2) Add data to vector store - pick one
  // await storeEntries(entries);
  // await storeEntriesFromJson();
  // await addToDbFromJSON();

  // Query and retrieve
  await embedQueryAndRetrieve("What is gas limit in CCIP?");
}

main().catch(console.error);
