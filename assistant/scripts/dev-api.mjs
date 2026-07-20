import http from "node:http";

import { createNodeRequestHandler } from "../server/http-handler.mjs";

const port = Number.parseInt(process.env.PORT || "8788", 10);
const handler = createNodeRequestHandler();

const server = http.createServer((request, response) => {
  handler(request, response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Kris assistant API listening on http://127.0.0.1:${port}`);
});
