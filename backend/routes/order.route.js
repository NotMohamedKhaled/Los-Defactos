const router = require('express').Router();
const Auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const {
  adminDeleteOrder,
  adminRestoreOrder,   // ✅ FIXED: make sure it's imported
  adminGetAllOrders,
  userCancelOrder,
  userGetOrder,
  userGetAllOrders,
  adminUpdateOrderStatus
} = require('../controllers/order.controller');

const paginate = require('../middlewares/pagination.middleware');

// 🧭 Admin routes
router.get('/admin', Auth, role(['admin']), paginate(10, 50, { optional: true }), adminGetAllOrders);
router.put('/admin/delete/:id', Auth, role(['admin']), adminDeleteOrder);
router.put('/admin/update/:id', Auth, role(['admin']), adminUpdateOrderStatus);
router.put('/admin/restore/:id', Auth, role(['admin']), adminRestoreOrder);

// 👤 User routes
router.get('/', Auth, role(['user']), paginate(5, 20), userGetAllOrders);
router.get('/:id', Auth, role(['user']), userGetOrder);
router.put('/:id', Auth, role(['user']), userCancelOrder);

module.exports = router;
