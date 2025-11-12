import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import routes from "./routes/index.js";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || [],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Swagger configuration
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API running" });
});

// 404 + Error handling
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorMiddleware);

export default app;
