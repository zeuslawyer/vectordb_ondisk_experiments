import { connect, Index } from "@lancedb/lancedb";
import { DocTableSchema } from "./arrow-schema.js";

export const db = await connect("./data/lancedb");

/**
 * Consider using 2A_storeEntriesFromJson.js instead,if you have the JSON file of db entries.
 * This will save on calls to the embedding model.
 */
export const storeEntries = async entries => {
  console.log("Entries length, and vector length", entries.length, entries[0].vector.length);

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
        distanceType: "cosine",
        //   m: 1,
      }),
    });
    console.log(`Table ${table.name} created with ${await table.countRows()} rows`);
  } catch (error) {
    throw Error(`LanceDB Error: Error creating or indexing table: ${error}`);
  }

  return table;
};
