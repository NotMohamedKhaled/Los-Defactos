const jwt= require('jsonwebtoken');
const User = require('../models/user.model');

const createToken =(user)=>{
    const token = jwt.sign(
        {id:user._id ,name:user.name , role: user.role },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN})
        return token;
}

const login = async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email: email , isDeleted:false});
    if(!user){
        return res.status(401).json({message:'The email or the password is invalid'});
    }
    const isValidLogin = await user.comparePassword(password);
    if(isValidLogin){
        const token = createToken(user)
        return res.status(200).json({message:'Logged in successfully',token: token});
    }
    
    return res.status(401).json({message:'The email or the password is invalid'});


}

module.exports = login