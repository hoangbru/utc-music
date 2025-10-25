import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

// Import routes
import authRoutes from "./api/auth/routes.js";
import userRoutes from "./api/users/routes.js";
import songRoutes from "./api/songs/routes.js";
import playlistRoutes from "./api/playlists/routes.js";
import artistRoutes from "./api/artists/routes.js";
import albumRoutes from "./api/albums/routes.js";
import genreRoutes from "./api/genres/routes.js";
import browseRoutes from "./api/browse/routes.js";
import adminRoutes from "./api/admin/routes.js";

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Music Streaming API",
      version: "1.0.0",
      description:
        "A production-ready RESTful API for a music streaming service",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/api/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/me", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/search", browseRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Music Streaming API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handling middleware
app.use(errorMiddleware);

export default app;
