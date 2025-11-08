import jwt from 'jsonwebtoken';
import 'dotenv/config';

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

export default { authentication, authorizeRoles };
