import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
app.use(express.json());

// Better Auth Catch-all Route
app.all("/api/auth/{*path}", toNodeHandler(auth));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});