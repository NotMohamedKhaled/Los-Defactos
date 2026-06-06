const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const auth = async(req,res,next)=>{
    console.log('=== Auth middleware called ===');
    console.log('req.headers.authorization:', req.headers.authorization);
    
    const header= req.headers.authorization;
    if(!header?.startsWith('Bearer ')){
        console.log('No Bearer token found');
        return res.status(403).json({message:'No token provided'})
    }
    
    const token = header.split(' ')[1];
    console.log('Extracted token:', token);
    
    try {
        console.log('Verifying token with JWT_SECRET...');
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decode);
        console.log('Looking for user with ID:', decode.id);
        
        const user=  await User.findById(decode.id).select('-password')
        console.log('User found:', user);
        
        if(!user) {
            console.log('User not found in database');
            return res.status(404).json({message:"User not found"});
        }
        
        console.log('Setting req.user to:', user);
        req.user= user;
        console.log('req.user after setting:', req.user);
        
        next()
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({message:'Token is not valid or expired'})
    }
}

module.exports = auth