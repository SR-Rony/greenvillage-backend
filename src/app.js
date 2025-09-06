import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import uploadRoute from "./routes/upload.route.js"

const app = express();

// Security & utils
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());



const allowedOrigins = [
  'http://localhost:3000',
  'https://greenvillage-gxpz.vercel.app/'
];
// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // ✅ allows sending cookies cross-domain
}));

// Rate Limit
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", apiLimiter);

// Health
app.get("/api/health", (req, res) => {
  res.status(StatusCodes.OK).json({ ok: true, env: process.env.NODE_ENV || "development" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/orders", orderRoutes);


app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// 404
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(status).json({ message: err.message || "Server error" });
});

export default app;