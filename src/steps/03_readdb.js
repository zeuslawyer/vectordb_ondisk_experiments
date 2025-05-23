import { db } from "./02_store.js";
import { OpenAIEmbedding } from "@llamaindex/openai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

export const readDB = async () => {
  const table = await db.openTable("docs");

  console.log("TABLE SCHEMA:  ", await table.schema());

  const queryString = "how to test signed commits?";

  const embedModel = new OpenAIEmbedding({
    model: "text-embedding-3-small", // Latest model, more efficient and cost-effective
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.time("queryEmbedding And Vector Search");
  let queryEmbedding = await embedModel.getQueryEmbedding({ type: "text", text: queryString });

  // store to json
  fs.writeFileSync("./src/outputs/queryEmbedding.json", JSON.stringify(queryEmbedding, null, 2));
  console.log("queryEmbedding.json written");

  //   await table.createIndex("embedding");
  const rows = await table.search(queryEmbedding).limit(2).toArray();
  console.log(`${rows.length} rows returned in response to Query:   `);
  console.timeEnd("queryEmbedding And Vector Search");

  fs.writeFileSync("./src/outputs/returnedTexts.json", JSON.stringify(rows, null, 2));
  console.log("returnedTexts.json written");
  return rows;
};
