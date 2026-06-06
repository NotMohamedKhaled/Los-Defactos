const Faq = require("../models/faq.model");

exports.getPostedFaq = async (req, res) => {
  try {
    const faq = await Faq.find({ isPosted: true });
    if (!faq)
      return res.status(404).json({ message: " no questions were found" });
    return res.status(200).json({ message: "posted faq", data: faq });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllFaq = async (req,res)=>{
    try {
        const faq = await Faq.find();
        if (!faq)
          return res.status(404).json({ message: " no questions were found" });
        return res.status(200).json({ message: "faq list", data: faq });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
}

exports.addFaq = async (req,res)=>{
    try {
        const {question,answer,isPosted}=req.body;
        const faq =await Faq.create({question,answer,isPosted})
        return res.status(200).json({ message: "faq created succesfully", data: faq });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
}

exports.updateFaq = async (req,res)=>{
    try {
        const {id}= req.params;
        const {question , answer,isPosted} = req.body
        const faq = await Faq.findOneAndUpdate({_id:id},{question , answer,isPosted},{new:true});
        if (!faq) return res.status(404).json({ message: "that question isnt found" });
        return res.status(200).json({ message: "updated question", data: faq });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
}

exports.unpostFaq = 
async (req,res)=>{
    try {
        const {id}= req.params;
        
        const faq = await Faq.findOneAndUpdate({_id:id},{isPosted:!isPosted},{new:true});
        if (!faq) return res.status(404).json({ message: "that question isnt found" });
        return res.status(200).json({ message: "question is unposted", data: faq });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
}