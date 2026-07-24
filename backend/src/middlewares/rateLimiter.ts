import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit uploads to 50 files per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Upload limit reached for your IP. Please wait before uploading more files.',
  },
});
