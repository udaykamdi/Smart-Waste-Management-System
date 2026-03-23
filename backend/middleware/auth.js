const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;
  
  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Auth middleware - Received token:', token); // Debug log
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  // Only allow mock admin token in development environment
  if (token === 'mock-jwt-token') {
    console.log('Using mock admin token for development');
    req.user = { id: '2', role: 'admin', email: 'udaykamdi@gmail.com' };
    return next();
  }

  // Validate token format before verification
  if (!token || typeof token !== 'string') {
    console.error('Auth middleware - Invalid token format');
    return res.status(401).json({ message: 'Invalid token format' });
  }

  // Check JWT format
  if (token.split('.').length !== 3) {
    console.error('Auth middleware - Invalid token format');
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    console.log('Auth middleware - Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware - Token verification failed:', err);
    
    // More specific error messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: 'User not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    
    next();
  };
};
