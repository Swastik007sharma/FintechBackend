import express from "express";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth";
import financeRoutes from "./routes/finance.routes";
import userRoutes from "./routes/user.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// 1. Core Middleware
app.use(express.json());

// 2. Swagger API Documentation 
try {
  // process.cwd() ensures it looks from the root of your project
  const file = fs.readFileSync(path.resolve(process.cwd(), 'docs/FinTech.yaml'), 'utf8');
  const swaggerDocument = yaml.parse(file);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn("⚠️ Swagger docs not found. Skipping /api-docs route until FinTech.yaml is created.");
}

// 3. Auth Routes (Express v5 Syntax)
app.all("/api/auth/{*any}", toNodeHandler(auth));

// 4. API Routes
app.use("/api/finance", financeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Optional: A simple health check (Great for quick Postman validation)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "FinTech API is running" });
});

// 5. Global Error Handler (Must be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});
