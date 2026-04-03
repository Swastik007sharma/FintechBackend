import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
app.use(express.json());
app.all('/api/auth/{*any}', toNodeHandler(auth));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello, World!" });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});