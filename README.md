# How to Work The Lance DB Scripts

`./src/index.js` has commented out methods inside `main()`. Comment in and out as needed then run `node src/index`

Recommend Running the functions in the following way inside `./src/index.js`:

1. start with running `./src/steps/01_loadSplitEmbed.js`. This will save the chunks (nodes in llama speak) to the `./src/outputs/llamaindex.nodes.example.JSON` file and also each entry (chunk) for the vector store gets initially stored in `./src/outputs/entries.example.json`

2. then as long as you're satisfied with that step you dont need to repeat it. You can just load the entries from the json and store it to the vector db by commenting 01 and 02 but enabling `./src/steps/02A_storeEntriesFromJson.js`. This will save tokens on step 01. **Note** that in 02 and 02A the distance function (similarity search algorithm) needs to be set. See https://lancedb.github.io/lancedb/search/#distance-metrics

3. When you run `./src/steps/03_readdb.js` the output is saved to `./src/outputs/queryEmbedding.json` and `./src/outputs/returnedTexts.json`

# How to run the UI to inspect Lance DB Tables.

1. Set the `DB_PATH` and the `TABLE_NAME` constants in the `./ui/api-server.js` file to match the lancedb setup.

2. Run `pnpm ui:start` to start both the API server and UI server. This will:

   - Start the API server on port 8888 to serve LanceDB data
   - Start the Vite dev server on port 8880 to serve the UI

3. Open http://localhost:8880 in your browser to view the LanceDB table viewer

The UI provides:

- Table view of all entries in the LanceDB table
- Row count display
- Refresh button to reload data
- Scrollable table with fixed headers
- Formatted display of vectors and long text fields
