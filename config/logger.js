import winston from "winston";
import morgan from "morgan";

// Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

// Stream for morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Morgan middleware for request logging
export const requestLogger = morgan("combined", { stream: logger.stream });

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  logger.error(err.stack || err.message);
  next(err);
};

export default logger;
