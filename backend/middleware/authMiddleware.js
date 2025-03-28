const jwt = require('jsonwebtoken');

// Middleware to verify token and set user role
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });
    
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Middleware for role-based access
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.authLevel)) {
            return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = { authenticateUser, authorizeRole };

