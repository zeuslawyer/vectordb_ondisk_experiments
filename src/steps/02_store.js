import { connect, Index } from "@lancedb/lancedb";

export const db = await connect("./data/lancedb");

/**
 * Consider using 2A_storeEntriesFromJson.js instead,if you have the JSON file of db entries.
 * This will save on calls to the embedding model.
 */
export const storeEntries = async entries => {
  const table = await db.createTable("docs", tableData, {
    mode: "overwrite",
  });

  await table.createIndex("vectors", {
    type: "ivfPq",
    options: {
      numPartitions: 10,
      numSubVectors: 16,
    },
  });
  console.log(`Table ${table.name} created with ${table.numRows} rows`);

  return table;
};
