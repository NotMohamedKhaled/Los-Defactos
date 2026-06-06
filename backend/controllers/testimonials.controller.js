const Testimonials = require("../models/testimonials.model");
const User = require('../models/user.model')

exports.getPostedTesti = async (req, res) => {
  try {
    const testi = await Testimonials.find({ isPosted: true }).populate('user','name');
    if (!testi)
      return res.status(404).json({ message: "no testimonals are found" });
    return res
      .status(200)
      .json({ message: "Posted testimonials", data: testi });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getAllTesti = async (req, res) => {
  try {
    const testi = await Testimonials.find({}).populate('user','name');
    if (!testi)
      return res.status(404).json({ message: "no testimonals are found" });
    return res.status(200).json({ message: "testimonials list", data: testi });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.addTesti = async (req, res) => {
  try {
    const userID = req.user._id;
    const { message } = req.body;

    const newTesti = await Testimonials.create({
      user: userID,
      message,
      isPosted: false,
    });
    const user  = await User.findOne({_id:userID , isDeleted:false});
    user.testimonials.push(newTesti);
    await user.save();
    return res.status(201).json({ message: "testimonial added successfully", data: newTesti });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateTesti =  async (req, res) => {
    try {
        const {id}= req.params;
        const {isPosted} = req.body;
        const testi = await Testimonials.findById(id);
        if(!testi) return res.status(404).json({messages:"not found"})
      
        const newTesti = await Testimonials.findByIdAndUpdate(id,{isPosted},{new: true});
      return res.status(200).json({ message: "testimonial updated successfully", data: newTesti });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
// controllers/testimonialController.js

exports.deleteTesti = async (req, res) => {
  try {
    const testimonialId = req.params.id;
    const userId = req.user._id; // comes from Auth middleware

    // 1️⃣ Check if testimonial exists
    const testimonial = await Testimonials.findById(testimonialId);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // 2️⃣ Check if the testimonial belongs to the logged-in user
    if (testimonial.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this testimonial' });
    }

    // 3️⃣ Delete it
    await Testimonials.findByIdAndDelete(testimonialId);

    return res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
