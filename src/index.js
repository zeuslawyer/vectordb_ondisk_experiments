import { connect, Index, Table } from "@lancedb/lancedb";
import { loadAndSplitDoc } from "./pipeline/01_loadSplitEmbed.js";
import { loadDocsFromDirectory } from "./pipeline/01A_loadFromDirectory.js";
import { storeEntries } from "./pipeline/02_store.js";
import { storeEntriesFromJson } from "./pipeline/02A_storeEntriesFromJson.js";
import { embedQueryAndRetrieve } from "./pipeline/03_queryDb.js";

import dotenv from "dotenv";

dotenv.config();

async function main() {
  // const entries = await loadAndSplitDoc();
  // await storeEntries(entries);

  await loadDocsFromDirectory();
  await storeEntriesFromJson();
  await embedQueryAndRetrieve();
}

main().catch(console.error);
