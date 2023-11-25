import { ServerWebSocket } from "bun";
import { NlpManager } from "node-nlp";
import fs from "fs";
import { NlpModelLoader } from "nlp-model-helper-fun";

// Model directory and filename
const modelDirectory = "./models";
const dataDirectory = "./data";
const modelName = "model.nlp";
const trainingDataFile = "time-queries.json";

async function getTime(manager: any, query: any) {
  // call nlp
  const response = await manager.process("en", query);

  if (response.intent === "time.check") {
    // works out the time
    const currentTime = new Date().toLocaleTimeString();

    // sends the time
    return `The time is ${currentTime}.`;
  } else if (response.intent === "greetings.hello") {
    return `heyyyyyyy`;
  } else if (response.intent === "greetings.bye") {
    return `byeeeeee`;
  } else {
    return "i have no idea what you're talking about dude";
  }
}

async function main() {
  // check if we need to retrain the model
  const forceRetrain = process.argv.includes("--retrain");

  // load the model train
  const modelPath = `${modelDirectory}/${modelName}`;
  const trainingDataPath = `${dataDirectory}/${trainingDataFile}`;

  // load the nlp loader
  const nlpLoader = new NlpModelLoader(modelPath);

  // load or train the model
  const manager = await nlpLoader.loadOrTrainModel(
    trainingDataPath,
    forceRetrain
  );

  const server = Bun.serve({
    port: 3000,
    fetch(req, server) {
      if (server.upgrade(req)) {
        return; // WebSocket upgrade request
      }
      return new Response("Not found", { status: 404, statusText: "Not Found" });
    },
    websocket: {
      open(ws) {
        // connection opened
        const welcomeMessage = "Welcome to the Time Server! Ask 'What's the time?' and I shall answer.";
        ws.send(welcomeMessage);
        console.debug("Connection Opened");
      },
      message(ws, message) {
        // received message
        console.debug(`Received Message: ${message}`);
        
        // Convert message to string if it's an ArrayBuffer
        const messageString = typeof message === 'string' ? message : new TextDecoder().decode(message);

        // get the response
        getTime(manager, messageString.trim().toLowerCase()).then(response => {
          // send the response
          ws.send(response);

          // completed
          console.debug("Message Sent");
        });
      },
      close(ws) {
        console.debug("Connection Closed");
      },
    },
  });

  console.log(`Listening on localhost:${server.port}`);
}

main().catch(console.error);

