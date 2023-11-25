// index.tsx
import { ServerWebSocket } from "bun";

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

      // checks's for a what's the time message
      if (messageString.trim().toLowerCase() === "what's the time?") {
        // works out the time
        const currentTime = new Date().toLocaleTimeString();

        // sends the time
        ws.send(`The time is ${currentTime}.`);
      } else {
        // invalid message
        ws.send("I can only tell you the time if you ask nicely!");
      }

      // completed
      console.debug("Message Sent");
    },
    close(ws) {
      console.debug("Connection Closed");
    },
  },
});

console.log(`Listening on localhost:${server.port}`);
