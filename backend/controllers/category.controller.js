const Category = require('../models/category.model');
const { getUploadedImageUrl } = require('../middlewares/upload.middleware');

exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find({ isDeleted: false });
        return res.status(200).json({ message: 'categories list', data: categories });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ message: 'all categories list', data: categories });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.addCategory = async (req, res) => {
    try {
        const { name, desc } = req.body;
        if (!name || !desc) return res.status(400).json({ message: 'name and desc are required' });

        const existing = await Category.findOne({ name });
        if (existing) return res.status(400).json({ message: 'Category already exists' });

        const imgUrl = getUploadedImageUrl(req.file) || undefined;
        const category = await Category.create({ name, desc, imgUrl });
        return res.status(201).json({ message: 'category created successfully', data: category });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, desc } = req.body;
        const imgUrl = getUploadedImageUrl(req.file) || undefined;

        const update = { name, desc };
        if (imgUrl) update.imgUrl = imgUrl;

        const updated = await Category.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return res.status(404).json({ message: 'category id not found' });
        return res.status(200).json({ message: 'category updated successfully', data: updated });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deleted) return res.status(404).json({ message: 'category id not found' });
        return res.status(200).json({ message: 'category deleted successfully', data: deleted });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.restoreCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: 'category id not found' });
        if (!category.isDeleted) return res.status(400).json({ message: 'category is already active' });
        
        category.isDeleted = false;
        await category.save();
        return res.status(200).json({ message: 'category restored successfully', data: category });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}