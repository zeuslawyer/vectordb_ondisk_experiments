import { connect, Index } from "@lancedb/lancedb";

export const db = await connect("./data/lancedb");

export const storeEntries = async entries => {
  const tableData = entries.map(entry => ({
    ...entry,
    embedding: Array.from(entry.embedding), // Ensure embedding is an array
  }));

  const table = await db.createTable("docs", tableData, {
    mode: "overwrite",
  });

  // TODO resume here.  Table needs an index or embedding function.  Currently,
  // its gving an error [Error: Invalid input, there are no indices supported for the field `embedding` with the data type List(Field { name: "item", data_type: Float64, nullable: true, dict_id: 0, dict_is_ordered: false, metadata: {} })] {
  // code: 'GenericFailure'
  // }
  await table.createIndex("embedding", {
    type: "ivfPq",
    options: {
      numPartitions: 10,
      numSubVectors: 16,
    },
  });
  console.log(`Table ${table.name} created with ${table.numRows} rows`);

  return table;
};
