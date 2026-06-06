const router = require('express').Router();
const Auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const { createPaymentIntent } = require('../controllers/payment.controller');

router.post('/create-payment-intent', Auth, role(['user']), createPaymentIntent);

module.exports = router;
