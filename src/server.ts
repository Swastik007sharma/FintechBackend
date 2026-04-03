import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import financeRoutes from "./routes/finance.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
app.use(express.json());
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/finance", financeRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
