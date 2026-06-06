const { model } = require("mongoose");

const role = (roles) => {
    return (req, res, next) => {
        console.log('=== Role middleware called ===');
        console.log('req.user:', req.user);
        console.log('Required roles:', roles);
        
        if (!req.user) {
            console.log('No req.user found in role middleware');
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        if (!roles.includes(req.user.role)) {
            console.log('User role not in required roles');
            return res.status(403).json({ message: 'Access denied' });
        }
        
        console.log('Role check passed, calling next()');
        next(); // Make sure to call next() to continue to the next middleware
    };
};
module.exports = role