# how to run

`./src/index.js` has commented out methods inside `main()`. Comment in and out as needed then run `node src/index`

Recommend Running the functions in the following way inside `./src/index.js`:

1. start with running `./src/steps/01_loadSplitEmbed.js`. This will save the chunks (nodes in llama speak) to the `./src/outputs/llamaindex.nodes.example.JSON` file and also each entry (chunk) for the vector store gets initially stored in `./src/outputs/entries.example.json`

2. then as long as you're satisfied with that step you dont need to repeat it. You can just load the entries from the json and store it to the vector db by commenting 01 and 02 but enabling `./src/steps/02A_storeEntriesFromJson.js`. This will save tokens on step 01. **Note** that in 02 and 02A the distance function (similarity search algorithm) needs to be set. See https://lancedb.github.io/lancedb/search/#distance-metrics

3. When you run `./src/steps/03_readdb.js` the output is saved to `./src/outputs/queryEmbedding.json` and `./src/outputs/returnedTexts.json`
