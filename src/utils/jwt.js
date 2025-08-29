import jwt from "jsonwebtoken";

export function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn, ...options });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.verify(token, secret);
}