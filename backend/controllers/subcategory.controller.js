const SubCategory = require('../models/subCategory.model');

exports.addSubCategory = async (req, res) => {
    try {
        const { name, category, description } = req.body;
        if (!name || !category) return res.status(400).json({ message: 'name and category are required' });
        const exists = await SubCategory.findOne({ name, category, isDeleted: false });
        if (exists) return res.status(400).json({ message: 'subCategory already exists for this category' });
        const sub = await SubCategory.create({ name, category, description });
        return res.status(201).json({ message: 'subcategory created successfully', data: sub });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.getSubCategories = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isDeleted: false };
        if (category) filter.category = category;
        const subs = await SubCategory.find(filter).populate('category', 'name');
        return res.status(200).json({ message: 'subcategory list', data: subs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description, isDeleted } = req.body;
        const updateData = { name, category, description };
        
        // Handle isDeleted field if provided
        if (typeof isDeleted === 'boolean') {
            updateData.isDeleted = isDeleted;
        }
        
        const updated = await SubCategory.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ message: 'subcategory id not found' });
        
        const message = typeof isDeleted === 'boolean' 
            ? (isDeleted ? 'subcategory deleted successfully' : 'subcategory restored successfully')
            : 'subcategory updated successfully';
            
        return res.status(200).json({ message, data: updated });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await SubCategory.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deleted) return res.status(404).json({ message: 'subcategory id not found' });
        return res.status(200).json({ message: 'subcategory deleted successfully', data: deleted });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}


