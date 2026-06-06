const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    address: {
        type: [String],
        default: [],
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type:String,
        enum:['user','admin'],
        required: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: [],
    }],
    testimonials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Testimonials",
        default: [],
    }]
},
{
    timestamps:true
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

userSchema.methods.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
  };

module.exports = mongoose.model('User',userSchema)


