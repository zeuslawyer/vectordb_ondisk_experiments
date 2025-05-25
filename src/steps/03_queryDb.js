import { MODEL } from "./01_loadSplitEmbed.js";
import { db } from "./02_store.js";

import { OpenAIEmbedding } from "@llamaindex/openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const readDB = async () => {
  const table = await db.openTable("docs");
  // console.log("TABLE SCHEMA:  ", await table.schema());

  const QUERY = "what git command do i need to sign a git commit?";
  const RETRIEVE_LIMIT = 5;

  const embedModel = new OpenAIEmbedding({
    model: MODEL,
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.time("queryEmbedding And Vector Search");
  let queryEmbedding = await embedModel.getQueryEmbedding({ type: "text", text: QUERY });

  // store to json
  await fs.writeFileSync("./src/outputs/queryEmbedding.json", JSON.stringify(queryEmbedding, null, 2));
  console.log("queryEmbedding.json written");

  //   await table.createIndex("embedding");
  const rows = await table.search(queryEmbedding).limit(RETRIEVE_LIMIT).toArray();
  console.log(`${rows.length} rows returned in response to Query:   `);

  let textChunks = rows.map(row => {
    return { text: row.chunkText, metadata: row.metadata, chunkId: row.chunkId, _distance: row._distance };
  });

  await fs.writeFileSync("./src/outputs/returnedTexts.json", JSON.stringify(textChunks, null, 2));
  console.log("returnedTexts.json written");
  return rows;
};
