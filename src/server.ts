import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";

// Your internal module imports
import { auth } from "./lib/auth";
import financeRoutes from "./routes/finance.routes";
import userRoutes from "./routes/user.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { errorHandler } from "./middleware/error.middleware";

// 1. ES Module Path Resolution (Required for ESM in TypeScript)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 2. Core Middleware
app.use(express.json());

// 3. Swagger API Documentation (Vercel-Safe Configuration via CDN)
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
const JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.js"
];

try {
  const yamlPath = path.join(__dirname, "../docs/FinTech.yaml");
  
  if (fs.existsSync(yamlPath)) {
    const file = fs.readFileSync(yamlPath, 'utf8');
    const swaggerDocument = yaml.parse(file);

    app.use('/api-docs', swaggerUi.serve);
    app.get('/api-docs', swaggerUi.setup(swaggerDocument, {
      customCssUrl: CSS_URL,
      customJs: JS_URLS
    }));
  } else {
    console.warn(`⚠️ Swagger file not found at ${yamlPath}. Check your build script.`);
  }
} catch (error) {
  console.error("❌ Swagger Initialization Error:", error);
}

// 4. Auth Routes (Better-Auth Node Handler)
app.all("/api/auth/{*any}", toNodeHandler(auth));

// 5. API Routes
app.use("/api/finance", financeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 6. Health Check (Explicitly typed Request and Response)
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "FinTech API is running 🚀" });
});

// 7. Global Error Handler
app.use(errorHandler);

// 8. Server Execution (Skips app.listen on Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running locally on port ${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;