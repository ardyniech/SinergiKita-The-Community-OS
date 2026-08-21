import { rateLimit } from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20, // Limit each user/UID to 20 requests per minute
  validate: false,
  keyGenerator: (req) => {
    // Use verified Firebase uid from token, or fallback to IP/anonymous
    return (req as any).user?.uid || req.ip || "anonymous";
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Terlalu banyak permintaan (maksimal 20 request per menit per user). Silakan coba lagi nanti."
    });
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
