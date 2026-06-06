const Auth= require('../middlewares/auth.middleware')
const role= require('../middlewares/role.middleware')
const upload = require('../middlewares/upload.middleware');
const { uploadToCloudinary } = upload;
const {getAllCategory,getCategory,addCategory,updateCategory,deleteCategory,restoreCategory} = require('../controllers/category.controller')

const router = require('express').Router();

router.get('/',getCategory);
router.get('/admin',Auth,role(['admin']),getAllCategory)
router.post('/admin',Auth,role(['admin']),upload.single('img'), uploadToCloudinary, addCategory)
router.put('/admin/restore/:id',Auth,role(['admin']),restoreCategory)
router.put('/admin/:id',Auth,role(['admin']),upload.single('img'), uploadToCloudinary, updateCategory)
router.delete('/admin/:id', Auth,role(['admin']),deleteCategory)



 module.exports = router
