import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import { config } from "dotenv";
import MessageRouter from "./routes/messageRoutes.js";
import AdminRouter from "./routes/adminRoutes.js";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import escrowRouter from "./routes/escrowRoutes.js";
import helmet from "helmet";

const app = express();
config({ path: "./config.env" });

// Middleware setup
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,//allow cookies to be sent
  })
);

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
  })
);
// Route setup
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/message",MessageRouter);
app.use("/api/v1/admin", AdminRouter);
app.use("/api/v1/escrow", escrowRouter);

// Database connection
dbConnection();

app.get("/", (req, res) => {
  res.send("🟢 Handexa Yvana!!!! backend is running smoothly.");
});


app.use(errorMiddleware);
export default app;
