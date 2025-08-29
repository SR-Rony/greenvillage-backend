import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { sendMail } from "../utils/mailer.js";
import { registerSchema, loginSchema } from "../validators/auth.schemas.js";

export async function register(req, res) {
  try {
    const parsed = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: parsed.email });
    if (exists) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already registered" });

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const user = await User.create({ ...parsed, verificationCode });

    await sendMail({
      to: user.email,
      subject: "Verify your Greenvillage account",
      text: `Your verification code is ${verificationCode}`
    });

    res.status(StatusCodes.CREATED).json({ message: "Registered. Check email for verification code." });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: err.errors.map(e => e.message).join(", ") });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
}

export async function verifyEmail(req, res) {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  if (user.isVerified) return res.json({ message: "Already verified" });
  if (user.verificationCode !== code) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid code" });
  user.isVerified = true;
  user.verificationCode = null;
  await user.save();
  res.json({ message: "Email verified" });
}

export async function login(req, res) {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await User.findOne({ email: parsed.email });
    if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
    const ok = await user.comparePassword(parsed.password);
    if (!ok) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
    const token = signToken({ id: user._id, role: user.role });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ message: "Logged in", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: err.errors.map(e => e.message).join(", ") });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select("-password -verificationCode -resetCode");
  res.json({ user });
}

export async function logout(req, res) {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(StatusCodes.OK).json({ message: "If that email exists, a code has been sent" });
  const resetCode = crypto.randomInt(100000, 999999).toString();
  user.resetCode = resetCode;
  await user.save();
  await sendMail({
    to: user.email,
    subject: "Greenvillage password reset",
    text: `Your reset code is ${resetCode}`
  });
  res.json({ message: "Check your email for reset code" });
}

export async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.resetCode !== code) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid reset attempt" });
  }
  user.password = newPassword;
  user.resetCode = null;
  await user.save();
  res.json({ message: "Password updated" });
}