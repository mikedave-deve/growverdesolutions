import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import missionRoutes from "./routes/missionRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import notifyRoutes from "./routes/notifyRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import logisticsRoutes from "./routes/logisticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import careersRoutes from "./routes/careersRoutes.js";
import { notFoundMiddleware, errorMiddleware } from "./middleware/errorMiddleware.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.frontendOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/missions", missionRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/activity", activityRoutes);
  app.use("/api/notify", notifyRoutes);
  app.use("/api/payroll", payrollRoutes);
  app.use("/api/logistics", logisticsRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/support", supportRoutes);
  app.use("/api/careers", careersRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
