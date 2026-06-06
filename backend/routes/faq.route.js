const router = require('express').Router();
const Auth= require('../middlewares/auth.middleware')
const role= require('../middlewares/role.middleware')
const {getPostedFaq,getAllFaq,updateFaq,unpostFaq,addFaq} = require('../controllers/faq.controller.js')



router.get('/',getPostedFaq)
router.get('/admin',Auth, role(['admin']),getAllFaq)
router.post('/admin',Auth, role(['admin']),addFaq)
router.put('/admin/:id',Auth, role(['admin']),updateFaq)
router.delete('/admin/:id',Auth, role(['admin']),unpostFaq)

module.exports = router


