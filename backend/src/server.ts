import { createServer, type Server as HTTPServer } from "http";
import app from "./app";
import { ENV } from "./config/env";
import pool from "./config/db";
import { initSocket } from "./sockets/socket";

const httpServer: HTTPServer = createServer(app);
const HOST = '0.0.0.0';
// Initialize Socket.io
initSocket(httpServer);

(async () => {
  try {
    const conn = await pool.connect();
    console.log("DB is connected!");
    conn.release();

    httpServer.listen(Number(ENV.PORT), HOST, () => {
      console.log(
        `Server is running at "http://localhost:${ENV.PORT}" on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`,
      );
    });

    httpServer.on("error", (error) => {
      console.error("HTTP Server Error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down...`);
  // Force exit after 10 seconds if it doesn't close cleanly
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);

  httpServer.close(() => {
    console.log("HTTP server closed.");
    pool.end().then(() => {
      console.log("DB pool closed.");
      process.exit(0);
    });
  });
};

["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});
