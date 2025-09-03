import express from "express";
import dotenv from "dotenv-safe";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { connectToDatabase } from "./db.js";
import routes from "./routes/index.js";
import logger, { requestLogger, errorLogger } from "./config/logger.js";
import { seedAdminUser } from "./controllers/authController.js";

dotenv.config();

const app = express();

// Environment
const NODE_ENV = process.env.NODE_ENV || "development";
const isDevelopment = NODE_ENV === "development";
const isProduction = NODE_ENV === "production";

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use(isProduction ? helmet({ contentSecurityPolicy: false }) : helmet());
app.use(compression());
app.use(morgan("combined", { stream: logger.stream }));
app.use(requestLogger);

// Routes
app.use("/api/v1", routes);
app.use(errorLogger);

// Health check endpoint
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "it is working",
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Backend is running. Use /api/v1 for API endpoints.");
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: isDevelopment ? err.message : "Internal Server Error",
    stack: isDevelopment ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const startServer = async () => {
  try {
    await connectToDatabase();
    await seedAdminUser();

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
    });

    // Increase timeout for slow operations
    server.timeout = 300000;

    const shutdown = () => {
      logger.info("Shutting down server...");
      server.close(() => {
        logger.info("Server shut down gracefully");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Global unhandled error handlers
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection:", { promise, reason });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();
