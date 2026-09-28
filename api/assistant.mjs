export default function retiredAssistantEndpoint(_request, response) {
  response.statusCode = 410;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify({
    error: "The portfolio now uses client-side search; this API endpoint is retired."
  }));
}
