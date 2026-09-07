import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ENV } from "./config/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import fileRoutes from './routes/file.routes';

const app: Application = express();

// Middlewares
const allowedOrigins = (ENV.CLIENT_ORIGINS ?? ENV.CLIENT_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

// app.use(cors({ origin: ENV.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev")); // Automatically generating logs for all http requests to a server
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/project", projectRoutes);

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.send("<h1>Live Code Collaborator API is running...<h1>");
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;
