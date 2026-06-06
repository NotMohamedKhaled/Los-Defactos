const router = require("express").Router();
const Auth = require("../middlewares/auth.middleware");
const {getCart,mergeCart,checkout,deleteCart,addOneItem} = require("../controllers/cart.controller");
const role = require("../middlewares/role.middleware");

router.get("/", Auth, role(['user']), getCart);
router.post("/merge", Auth, role(['user']), mergeCart);
router.delete("/:productId", Auth, role(['user']), deleteCart);
router.post("/checkout", Auth,role(['user']),checkout);
router.post("/:productId", Auth,role(['user']),addOneItem);

module.exports = router;