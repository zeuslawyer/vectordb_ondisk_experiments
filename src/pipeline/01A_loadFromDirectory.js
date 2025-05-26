import { OpenAIEmbedding } from "@llamaindex/openai";
import { Document, IngestionPipeline, SentenceSplitter } from "llamaindex";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { MarkdownReader } from "@llamaindex/readers/markdown";
import { PDFReader } from "@llamaindex/readers/pdf";
import { fileURLToPath } from "url";

import fs from "node:fs/promises";
import path from "node:path";

import { MODEL } from "./01_loadSplitEmbed.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dirPath = path.resolve(currentDir, "../input");

export const loadDocsFromDirectory = async () => {
  const TIMER_LABEL = "LoadFromDirectory Pipeline Run Time";
  console.info("Running ingestion pipeline");
  console.time(TIMER_LABEL);

  const reader = new SimpleDirectoryReader();
  const docs = await reader.loadData({
    directoryPath: dirPath,
    numWorkers: 4,
    fileExtToReader: {
      ".txt": new MarkdownReader(),
      ".md": new MarkdownReader(),
      ".pdf": new PDFReader(),
    },
    defaultReader: new MarkdownReader(),
  });

  const docsWithMetadata = docs.map(d => {
    return new Document({
      text: d.text,
      metadata: {
        source: d.metadata.file_name,
      },
    });
  });

  const CHUNK_SIZE = 700;
  const CHUNK_OVERLAP = 50;
  const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
      }),
      new OpenAIEmbedding({
        model: MODEL,
        apiKey: process.env.OPENAI_API_KEY,
      }),
    ],
  });

  const nodes = await pipeline.run({ documents: docsWithMetadata });
  console.timeEnd(TIMER_LABEL);

  await fs.writeFile(
    "./src/outputs/llamaindex.1ANodes.example.JSON",
    JSON.stringify(nodes, null, 2)
  );
  console.log("Nodes written to `./outputs/llamaindex.1ANodes.example.json");

  // Transform to entries to satisfy DB structure
  const dbEntries = nodes.map(n => ({
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

  await fs.writeFile(
    "./src/outputs/1A_entries.example.json",
    JSON.stringify(dbEntries, null, 2)
  );
  console.log("Entries written to `./outputs/1A_entries.example.json");

  return { dbEntries, docsWithMetadata };
};
