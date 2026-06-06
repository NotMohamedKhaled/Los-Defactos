const express =require('express');
const login = require('../controllers/auth.controller');
const router = express.Router();
const { authLimiter } = require('../middlewares/rate.limiter.middleware');

router.post('/',authLimiter,login)
module.exports= router