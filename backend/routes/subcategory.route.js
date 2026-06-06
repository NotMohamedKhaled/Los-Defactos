const router = require('express').Router();
const Auth= require('../middlewares/auth.middleware')
const role= require('../middlewares/role.middleware')
const { addSubCategory, getSubCategories, updateSubCategory, deleteSubCategory } = require('../controllers/subcategory.controller');

router.get('/', getSubCategories);
router.post('/admin', Auth, role(['admin']), addSubCategory);
router.put('/admin/:id', Auth, role(['admin']), updateSubCategory);
router.delete('/admin/:id', Auth, role(['admin']), deleteSubCategory);

module.exports = router

