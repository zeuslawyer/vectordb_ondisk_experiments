import { Index } from "@lancedb/lancedb";
import "@lancedb/lancedb/embedding/openai";

import { db } from "./02_store.js";
import fs from "fs";
import { DocTableSchema } from "./arrow-schema.js";

/**
 * NOTE:  @dev THIS FILE IS designed to be invoked after running `./01_loadSplitEmbed.js`
 * in which a single new file is split and embedded rather than the entire dir
 */

export const addToDbFromJSON = async () => {
  const entries = JSON.parse(fs.readFileSync("./src/outputs/entries.example.json", "utf8"));

  console.log("Entries length, and vector length", entries.length, entries[0].vector.length);

  for (const e of entries) {
    if (!e.metadata || !e.metadata.sourceDocId) {
      throw new Error(`Missing sourceDocId in chunkId: ${e.chunkId}`);
    } else {
      console.log(`Entry with chunkId: ${e.chunkId} has sourceDocId: ${e.metadata.sourceDocId}`);
    }
  }

  const docsTable = await db.openTable("docs");

  console.log("Tables");

  const startRowCount = await docsTable.countRows();
  console.log("\nStart row count", startRowCount);
  await docsTable.add(entries, { mode: "append" });

  try {
    const endRowCount = await docsTable.countRows();
    console.log("\nEnd row count", startRowCount, ". Now indexing...");

    if (endRowCount > 256) {
      console.log("more than 256 entries so running ivfPq indexing ", endRowCount);
      await docsTable.createIndex("vector", {
        config: Index.ivfPq({
          maxIterations: 2,
          distanceType: "cosine",
          sampleRate: 75,
        }),
      });
    } else {
      console.log("Less than 256 entries so running HNSW-Sq indexing ", endRowCount);
      await docsTable.createIndex("vector", {
        config: Index.hnswSq({
          //   maxIterations: 2,
          //   numSubVectors: 2,
          //   numPartitions: 1,
          distanceType: "cosine", // TODO resume:  which distance type is best? so none of these look good!
          //   m: 1,
        }),
      });
    }

    console.log(`Table "${docsTable.name}" uodated with ${endRowCount - startRowCount} rows`);
  } catch (error) {
    throw Error(`LanceDB Error: Error indexing updated docs table: ${error}`);
  }
  return docsTable;
};
