import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const generateToken = (uid, email) => {
  return jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "24h" });
};

export const generateRefreshToken = (uid, email) => {
  return jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "7d" });
};
