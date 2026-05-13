// Vercel serverless entry point — exports the Express app without starting
// the HTTP server. The build step compiles this to dist/handler.mjs which
// api/[...path].js imports as a Vercel serverless function.
export { default } from "./app";
