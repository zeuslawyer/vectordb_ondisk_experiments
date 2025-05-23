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
  const MODEL = "text-embedding-3-small";

  const entries = JSON.parse(fs.readFileSync("./src/outputs/llamaindex.entries.example.json", "utf8"));
  console.log("Entries length, and vector length", entries.length, entries[0].vector.length);

  const func = getRegistry().get("openai").create({ model: MODEL });

  const table = await db.createTable("docs", entries, {
    mode: "overwrite",
    schema: DocTableSchema,
  });

  await table.createIndex("vector", {
    config: Index.hnswSq({
      //   maxIterations: 2,
      //   numSubVectors: 2,
      //   numPartitions: 1,
      distanceType: "cosine",
      //   m: 1,
    }),
  });
  console.log(`Table ${table.name} created with ${await table.countRows()} rows`);

  return table;
};
