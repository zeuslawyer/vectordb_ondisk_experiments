import { Schema, Field, Struct, Float32, Utf8, FixedSizeList } from "apache-arrow";

// Define the metadata struct schema
const metadataStruct = new Struct([
  // TODO Resume here make all 3 non nullable if
  // https://github.com/lancedb/lancedb/issues/2393 has been fixed
  new Field("sourceDocId", new Utf8(), true), // false means non-nullable
  new Field("sourceDocFilename", new Utf8(), true),
  new Field("sourceDocHash", new Utf8(), true),
]);

// Define vector as FixedSizeList of 1536 Float32 values as we're using OpenAI's text-embedding-3-small model
const fixedSizeVectorField = new Field("vector", new FixedSizeList(1536, new Field("item", new Float32())), false);

// Define the complete schema
export const DocTableSchema = new Schema([
  new Field("chunkId", new Utf8(), false),
  new Field("metadata", metadataStruct, false),
  fixedSizeVectorField,
  new Field("chunkType", new Utf8(), false),
  new Field("chunkText", new Utf8(), false),
  new Field("chunkHash", new Utf8(), false),
]);
