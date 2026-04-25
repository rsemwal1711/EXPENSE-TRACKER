import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "expense-tracker-jwt-secret-2024";

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Middleware to verify session authentication
export const authenticateSession = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
};

// Function to generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Function to verify token (for use in controllers)
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default { authenticateToken, authenticateSession, generateToken, verifyToken };