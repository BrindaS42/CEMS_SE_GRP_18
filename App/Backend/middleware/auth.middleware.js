import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/user.model.js';

const authentication = (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

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

const authorizeRoles = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

const checkSuspension = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication error: User ID not found in token." });
    }

    const user = await User.findById(req.user.id).select('status');

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: "Access denied. Your account has been suspended." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Server error during suspension check." });
  }
};

export default { authentication, authorizeRoles, checkSuspension };