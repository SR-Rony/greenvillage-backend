import { verifyToken } from "../utils/jwt.js";
import { StatusCodes } from "http-status-codes";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    if (!token) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authenticated" });
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin only" });
  }
  next();
}