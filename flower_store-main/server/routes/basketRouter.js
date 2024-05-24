const Router = require('express');
const router = new Router();
const basketController = require('../controllers/basketController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, basketController.addToBasket);
router.get('/', authMiddleware, basketController.getAllProductsInBasket);
router.get('/:productId', authMiddleware, basketController.getOneProductInBasket);
router.delete('/remove', authMiddleware, basketController.removeFromBasket);

module.exports = router;
