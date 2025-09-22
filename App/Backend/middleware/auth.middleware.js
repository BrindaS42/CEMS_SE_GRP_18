import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTKEY);
    req.user = decoded; 
    next(); 
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token has expired" });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      return res.status(500).json({ error: "Token verification failed" });
    }
  }
};

export default authMiddleware;
