import { Index } from "@lancedb/lancedb";
import "@lancedb/lancedb/embedding/openai";
import { LanceSchema, getRegistry, register } from "@lancedb/lancedb/embedding";
import { EmbeddingFunction } from "@lancedb/lancedb/embedding";

import { db } from "./02_store.js";
import fs from "fs";
import { DocTableSchema } from "./arrow-schema.js";

/**
 * THIS FILE IS TO AVOID RUNNING LOAD AND EMBED AND INSTEAD LOAD THE SAVED ENTRIES FROM THE JSON AND STORE THEM IN THE DATABASE
 */

export const storeEntriesFromJson = async () => {
  const entries = JSON.parse(fs.readFileSync("./src/outputs/entries.example.json", "utf8"));
  console.log("Entries length, and vector length", entries.length, entries[0].vector.length);

  for (const e of entries) {
    if (!e.metadata || !e.metadata.sourceDocId) {
      throw new Error(`Missing sourceDocId in chunkId: ${e.chunkId}`);
    } else {
      console.log(`chunkId: ${e.chunkId} has sourceDocId: ${e.metadata.sourceDocId}`);
    }
  }

  let table;
  try {
    table = await db.createTable("docs", entries, {
      mode: "overwrite",
      schema: DocTableSchema,
    });

    await table.createIndex("vector", {
      config: Index.hnswSq({
        //   maxIterations: 2,
        //   numSubVectors: 2,
        //   numPartitions: 1,
        distanceType: "cosine", // TODO resume:  which distance type is best? so none of these look good!
        //   m: 1,
      }),
    });
    console.log(`Table ${table.name} created with ${await table.countRows()} rows`);
  } catch (error) {
    throw Error(`LanceDB Error: Error creating or indexing table: ${error}`);
  }
  return table;
};
