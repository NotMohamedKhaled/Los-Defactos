const User = require('../models/user.model');
const Order = require('../models/order.model');
const { paginationMeta } = require('../middlewares/pagination.middleware');
exports.createUser = (role) => {
    return async (req, res) => {
        try {
            const { name, phone, email, address, password } = req.body;

            const notValidEmail = await User.findOne({ email});
            if (notValidEmail) return res.status(401).json({ message: 'This Email is already signned up', valid: false });

            const notValidPhone = await User.findOne({ phone});
            if (notValidPhone) return res.status(401).json({ message: 'This Phone is already used', valid: false });

            const addressList = address
                ? (Array.isArray(address) ? address : [address])
                : [];

            const user = await User.create({ name, phone, email, address: addressList, password, role: role });
            return res.status(201).json({ message: 'User created successfully', data: user });

        } catch (error) {
            return res.status(401).json({ message: error.message });
        }
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const sort = { createdAt: -1 };
        const filter = {};

        if (req.query.excludeId) {
            filter._id = { $ne: req.query.excludeId };
        }

        if (!req.pagination) {
            const users = await User.find(filter).populate('orders').select('-password').sort(sort);
            return res.status(200).json({ message: 'Users list', data: users });
        }

        const { page, limit, skip } = req.pagination;
        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).select('-password').sort(sort).skip(skip).limit(limit),
        ]);

        return res.status(200).json({
            message: 'Users list',
            data: users,
            pagination: paginationMeta(total, page, limit),
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.adminGetUserOrders = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('orders');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.orders?.length) {
            return res.status(200).json({ message: 'User orders', data: [] });
        }

        const orders = await Order.find({ _id: { $in: user.orders } })
            .select('_id totalPrice orderStat orderedAt')
            .sort({ createdAt: -1 });

        return res.status(200).json({ message: 'User orders', data: orders });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.getUser = async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findOne({ _id: id, isDeleted: false }).select('-password').populate('testimonials');
        if (!user) return res.status(404).json({ message: 'user not found' });
        return res.status(200).json({ message: `user's data of id: ${id}`, data: user })
    } catch (error) {
        return res.status(401).json({ message: error.message })
    }

}
exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User restored successfully', user });
  } catch (error) {
    console.error('❌ Restore user error:', error);
    res.status(500).json({ message: 'Server error while restoring user' });
  }
};


exports.deleteUser = async (req,res)=>{
    try {
        const {id}= req.params;
        const user = await User.findById(id);
        if(!user) return res.status(404).json({message:"User not found"});

        const deletedUser = await User.findByIdAndUpdate(id,{isDeleted:true},{new:true});
        return res.status(200).json({message:'user is deleted successfullay', data:deletedUser});
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const id = req.user._id;
        const { name, phone, address } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) {
            updateData.address = Array.isArray(address) ? address : [address];
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })
            .select('-password')
            .populate('testimonials');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ message: 'Profile updated successfully', data: updatedUser });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.updateUser = async (req,res)=>{
    try {
        const {id}= req.params;
        const {name, phone, email, address, isDeleted} = req.body;
        const user = await User.findById(id);
        if(!user) return res.status(404).json({message:"User not found"});

        const updateData = {name, phone, email, address};
        
        // Handle isDeleted field if provided
        if (typeof isDeleted === 'boolean') {
            updateData.isDeleted = isDeleted;
        }
        
        const updatedUser = await User.findByIdAndUpdate(id, updateData, {new:true}).select('-password');
        
        const message = typeof isDeleted === 'boolean' 
            ? (isDeleted ? 'user deleted successfully' : 'user restored successfully')
            : 'user updated successfully';
            
        return res.status(200).json({message, data:updatedUser});
    } catch (error) {
        return res.status(400).json({message:error.message});
    }
}


