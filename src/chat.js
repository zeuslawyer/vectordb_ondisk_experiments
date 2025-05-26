import readline from "readline";
import { embedQueryAndRetrieve } from "./pipeline/03_queryDb.js";

// Create readline interface
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const topics = ["Git Commit Signing"];

const concatTopics = (topics) => {
  if (topics.length === 0) throw new Error("No topics supported");
  if (topics.length === 1) return topics[0];

  const lastTopic = topics[topics.length - 1];
  const otherTopics = topics.slice(0, -1);

  return `${otherTopics.join(", ")}, and ${lastTopic}.`;
};

/**
 *
 * @param {*} handleQuery: Function that takes the query string and initiated embedding,and querying vectorstore, and then the LLM.
 */
async function startChat(handleQuery) {
  try {
    while (true) {
      const query = await new Promise((resolve) => {
        rl.question(
          `\nEnter your query on these topics: ${concatTopics(topics)} (or "exit" to quit)\n\n>>>`,
          resolve
        );
      });

      // Check for exit command
      if (query.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        break;
      }

      try {
        // Process query using the provided function
        const response = await handleQuery(query);
        console.log("\nResponse:", response, "\n");
      } catch (error) {
        console.error("Error processing query:", error.message);
      }
    }
  } catch (error) {
    console.error("Chat error:", error.message);
  }
}

// Example usage (replace this with your actual function):
const queryLLM = async (query) => {
  const { aiResponse } = await embedQueryAndRetrieve(query);
  return `Response from LLM: ${aiResponse.output[0].content[0].text}`;
};

// Start the chat
startChat(queryLLM).catch(console.error);
