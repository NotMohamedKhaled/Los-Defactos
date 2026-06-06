const Auth= require('../middlewares/auth.middleware')
const role= require('../middlewares/role.middleware')
const {getPostedTesti,getAllTesti,addTesti,updateTesti,deleteTesti} = require('../controllers/testimonials.controller')

const router = require('express').Router();

router.get('/',getPostedTesti)
router.get('/admin',Auth,role(['admin']),getAllTesti)
router.post('/',Auth,role(['user']),addTesti)
router.put('/admin/:id',Auth,role(['admin']),updateTesti)
router.delete('/:id', Auth, role(['user']), deleteTesti)


 module.exports = router
