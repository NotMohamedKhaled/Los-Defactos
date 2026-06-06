const express = require('express');
const router = express.Router();
const Auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const paginate = require('../middlewares/pagination.middleware');
const {
  createUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  updateProfile,
  restoreUser,
  adminGetUserOrders,
} = require('../controllers/user.controller');

router.post('/', createUser('user'));
router.post('/createadmin', Auth, role(['admin']), createUser('admin'));
router.get('/admin', Auth, role(['admin']), paginate(10, 50, { optional: true }), getAllUsers);
router.get('/admin/:id/orders', Auth, role(['admin']), adminGetUserOrders);
router.get('/', Auth, role(['admin', 'user']), getUser);
router.put('/profile', Auth, role(['user']), updateProfile);
router.delete('/:id', Auth, role(['admin']), deleteUser);
router.put('/restore/:id', Auth, role(['admin']), restoreUser);

module.exports = router;
