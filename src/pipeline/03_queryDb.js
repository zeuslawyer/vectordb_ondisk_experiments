import { MODEL } from "./01_loadSplitEmbed.js";
import { db } from "./02_store.js";

import { OpenAIEmbedding } from "@llamaindex/openai";
import { OpenAI } from "openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const embedQueryAndRetrieve = async (query) => {
  if (!query) {
    console.log("\n*** No query provided*** \n");
    return;
  }

  const table = await db.openTable("docs");
  // console.log("TABLE SCHEMA:  ", await table.schema());

  const RETRIEVE_LIMIT = 5;

  const embedModel = new OpenAIEmbedding({
    model: MODEL,
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.time("queryEmbedding And Vector Search");
  let queryEmbedding = await embedModel.getQueryEmbedding({
    type: "text",
    text: query,
  });

  // store to json
  await fs.writeFileSync(
    "./src/outputs/queryEmbedding.json",
    JSON.stringify(queryEmbedding, null, 2)
  );
  console.log("queryEmbedding.json written");

  //   await table.createIndex("embedding");
  const rows = await table.search(queryEmbedding).limit(RETRIEVE_LIMIT).toArray();
  console.log(`${rows.length} rows returned in response to Query:   `);

  let textChunks = rows.map((row) => {
    return {
      text: row.chunkText,
      metadata: row.metadata,
      chunkId: row.chunkId,
      _distance: row._distance,
    };
  });

  await fs.writeFileSync("./src/outputs/llmResponse.json", JSON.stringify(textChunks, null, 2));
  console.log("llmResponse.json written");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const aiResponse = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You are a helpful assistant that answers questions based on the provided context. But if you dont have enough information for the answer you say so rather than attempt an answer that may be incorrect",
      },
      {
        role: "user",
        content: `Based on the following context, answer this question: 
          ${query}\n\nContext:\n${textChunks.map((chunk) => chunk.text).join("\n\n")}`,
      },
    ],
  });

  fs.writeFileSync("./src/outputs/aiResponse.json", JSON.stringify(aiResponse, null, 2));
  console.log("aiResponse.json written");

  console.log("AI Response:", aiResponse.output[0].content[0].text);
  if (aiResponse.reasoning) {
    console.log("\nReasoning Summary:", aiResponse.reasoning.summary || "Null");
  }

  return { rows, aiResponse };
};
