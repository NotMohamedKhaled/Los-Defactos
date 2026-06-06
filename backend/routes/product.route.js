const router = require('express').Router();
const Auth= require('../middlewares/auth.middleware')
const role= require('../middlewares/role.middleware')
const filter = require('../middlewares/filter.middleware');
const paginate = require('../middlewares/pagination.middleware');
const { addProduct, getProducts, getProductBySlug, editProduct, deleteProduct, getAllProducts,restoreProduct } =
  require('../controllers/products.controller');
const upload = require('../middlewares/upload.middleware');
const { uploadToCloudinary } = upload;

router.get('/admin', Auth, role(['admin']), paginate(10, 50, { optional: true }), getAllProducts);
router.post('/admin', Auth, role(['admin']), upload.single('img'), uploadToCloudinary, addProduct);
router.put('/admin/:id', Auth, role(['admin']), upload.single('img'), uploadToCloudinary, editProduct);
router.put('/admin/restore/:id', Auth, role(['admin']), upload.single('img'), uploadToCloudinary, restoreProduct);
router.delete('/admin/:id', Auth, role(['admin']), deleteProduct);

// 🟢 User routes BELOW
router.get('/', filter(['title', 'price', 'stock', 'category', 'subCategory', 'isInStock', 'keywords']), paginate(10, 20), getProducts);
router.get('/:slug', getProductBySlug);


module.exports = router