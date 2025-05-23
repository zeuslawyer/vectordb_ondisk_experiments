import { connect, Index, Table } from "@lancedb/lancedb";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { Document, IngestionPipeline, SentenceSplitter, VectorStoreIndex } from "llamaindex";
import dotenv from "dotenv";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";

dotenv.config();

/**
 * Load and split a document into chunks.
 * @returns {Promise<Array>} An array of entries which has the following structure:
 * {
 *   chunkId: string,
 *   metadata: {
 *     sourceDocId: string,
 *     sourceDocFilename: string,
 *     sourceDocHash: string,
 *   },
 *   vector: number[],
 *   chunkType: string,
 *   chunkText: string,
 *   chunkHash: string,
 * }
 */
export const loadAndSplitDoc = async () => {
  // Load essay from abramov.txt in Node
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const filepath = path.resolve(currentDir, "../input/dummy-macos.md");

  const sourceDoc = await fs.readFile(filepath, "utf-8");

  // Create Document object with essay
  const document = new Document({
    text: sourceDoc,
    nodeId: path.basename(filepath),
    metadata: { source: path.basename(filepath) },
  });

  const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({ chunkSize: 1024, chunkOverlap: 100 }),
      new OpenAIEmbedding({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
      }),
    ],
  });
  console.time("Pipeline Run Time");

  const nodes = await pipeline.run({ documents: [document] });

  console.timeEnd("Pipeline Run Time");

  fs.writeFile("./src/outputs/llamaindex.nodes.example.JSON", JSON.stringify(nodes, null, 2)).then(() => {
    console.log("Nodes written to `./outputs/llamaindex.nodes.example.json");
  });

  const entries = nodes.map(n => ({
    chunkId: n.id_,
    metadata: {
      sourceDocId: n.relationships["SOURCE"].nodeId,
      sourceDocFilename: n.relationships["SOURCE"].metadata.source,
      sourceDocHash: n.relationships["SOURCE"].hash,
    },
    vector: n.embedding,
    chunkType: n.type,
    chunkText: n.text,
    chunkHash: n.hash,
  }));

  fs.writeFile("./src/outputs/llamaindex.entries.example.json", JSON.stringify(entries, null, 2)).then(() => {
    console.log("Entries written to `./outputs/llamaindex.entries.example.json");
  });
  return entries;

  //   // initialize the VectorStoreIndex from nodes
  //   const index = await VectorStoreIndex.init({ nodes });

  //   // Query the index
  //   const queryEngine = index.asQueryEngine();

  //   const { message } = await queryEngine.query({
  //     query: "summarize the article in three sentence",
  //   });
};
