const Order = require('../models/order.model');
const User = require('../models/user.model');
const { paginationMeta } = require('../middlewares/pagination.middleware');

exports.adminGetAllOrders = async (req, res) => {
  try {
    const sort = { createdAt: -1 };
    const populateUser = { path: 'user', select: 'name email phone address' };
    const populateProducts = { path: 'products.product', select: 'title imgUrl price' };

    if (!req.pagination) {
      const orders = await Order.find().populate(populateUser).populate(populateProducts).sort(sort);
      return res.status(200).json({ message: 'Orders list', data: orders });
    }

    const { page, limit, skip } = req.pagination;
    const [total, orders] = await Promise.all([
      Order.countDocuments(),
      Order.find().populate(populateUser).populate(populateProducts).sort(sort).skip(skip).limit(limit),
    ]);

    return res.status(200).json({
      message: 'Orders list',
      data: orders,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};
exports.userGetAllOrders = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const filter = { user: user._id, isDeleted: false };
    const sort = { createdAt: -1 };
    const populate = [
      { path: 'user', select: 'name phone email address' },
      { path: 'products.product', select: 'title imgUrl' },
    ];

    if (!req.pagination) {
      const orders = await Order.find(filter).populate(populate).sort(sort);
      return res.status(200).json({ message: 'Orders list', data: orders });
    }

    const { page, limit, skip } = req.pagination;
    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter).populate(populate).sort(sort).skip(skip).limit(limit),
    ]);

    return res.status(200).json({
      message: 'Orders list',
      data: orders,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.userGetOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: req.user._id, isDeleted: false });
        if (!user) return res.status(404).json({ message: 'user are not found' });

        const order = await Order.findOne({user:user._id, _id:id , isDeleted:false}).
        populate('user','name phone email address').
        populate('products.product','title , imgUrl');
        if (!order) return res.status(404).json({ message: 'no orders were found' });

        return res.status(200).json({message:'order list', data:order});
    } catch (error) {
        return res.status((500)).json({ message: error.message });
    }
}

exports.userCancelOrder = async (req,res)=>{
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: req.user._id, isDeleted: false });
        if (!user) return res.status(404).json({ message: 'user are not found' });

        const order = await Order.findOne({user:user._id, _id:id , isDeleted:false})

        if (order.orderStat ==='cancelled') return res.status(400).json({ message: 'this order is already cancelled' });
        if (order.orderStat !=='pending') return res.status(400).json({ message: 'Cant cancel orders unless its still pending' });

        order.orderStat = 'cancelled';
        await order.save();
        return res.status(200).json({message:'order is cancelled', data:order});
    } catch (error) {
        return res.status((500)).json({ message: error.message });
    }
}

exports.adminDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    return res.status(200).json({ message: 'Order deleted successfully', data: order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🔁 Admin restores a previously deleted order
exports.adminRestoreOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found or already active' });

    return res.status(200).json({ message: 'Order restored successfully', data: order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedStat } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStat: updatedStat },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
