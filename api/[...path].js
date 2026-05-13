// Vercel catch-all serverless function — routes all /api/* requests to the
// Express app compiled by artifacts/api-server/build.mjs.
export { default } from "../artifacts/api-server/dist/handler.mjs";
