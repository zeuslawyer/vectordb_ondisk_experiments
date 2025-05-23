import { MODEL } from "./01_loadSplitEmbed.js";
import { db } from "./02_store.js";

import { OpenAIEmbedding } from "@llamaindex/openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const readDB = async () => {
  const table = await db.openTable("docs");
  // console.log("TABLE SCHEMA:  ", await table.schema());

  const QUERY = "what is the gasCeilingMultiplier ?";
  const RETRIEVE_LIMIT = 2;

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
  console.timeEnd("queryEmbedding And Vector Search");

  await fs.writeFileSync("./src/outputs/returnedTexts.json", JSON.stringify(rows, null, 2));
  console.log("returnedTexts.json written");
  return rows;
};
