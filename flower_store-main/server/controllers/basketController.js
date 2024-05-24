const { User, Basket, BasketProduct, Product } = require('../models/models');
const ApiError = require('../error/ApiError');

class BasketController {
    async addToBasket(req, res, next) {
        const { productId } = req.body;
        try {
            const userId = req.user.id; // Получаем id текущего пользователя из аутентификации

            // Находим корзину текущего пользователя или создаем новую, если ее нет
            let basket = await Basket.findOne({
                where: { userId },
                include: [{ model: Product, as: 'products' }]
            });

            if (!basket) {
                basket = await Basket.create({ userId });
            }

            // Добавляем продукт в корзину
            await BasketProduct.create({ basketId: basket.id, productId });

            // Получаем обновленную корзину с продуктами
            const updatedBasket = await Basket.findOne({
                where: { userId },
                include: [{ model: Product, as: 'products' }]
            });

            return res.json(updatedBasket);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAllProductsInBasket(req, res) {
        try {
            const userId = req.user.id; // Получаем id текущего пользователя из аутентификации

            // Находим корзину текущего пользователя и все продукты, связанные с ней
            const basket = await Basket.findOne({
                where: { userId },
                include: [{ model: Product, as: 'products' }]
            });

            if (!basket) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            res.status(200).json(basket.products);
        } catch (error) {
            console.error('Ошибка при получении продуктов из корзины:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }

    async getOneProductInBasket(req, res) {
        const { productId } = req.params;

        try {
            const userId = req.user.id;

            // Находим корзину пользователя и продукт в ней по его идентификатору
            const basket = await Basket.findOne({
                where: { userId },
                include: {
                    model: Product,
                    as: 'products',
                    where: { id: productId },
                    required: true
                }
            });

            if (!basket) {
                return res.status(404).json({ message: 'Продукт в корзине не найден' });
            }

            // Возвращаем найденный продукт из корзины
            res.json(basket.products[0]);
        } catch (error) {
            console.error('Ошибка при получении продукта из корзины:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }

    async removeFromBasket(req, res) {
        const { productId } = req.body;
        try {
            const userId = req.user.id;

            // Находим корзину пользователя
            const basket = await Basket.findOne({ where: { userId } });
            if (!basket) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            // Удаляем продукт из корзины
            const result = await BasketProduct.destroy({
                where: { basketId: basket.id, productId }
            });

            if (result === 0) {
                return res.status(404).json({ message: 'Продукт в корзине не найден' });
            }

            res.status(200).json({ message: 'Продукт успешно удален из корзины' });
        } catch (error) {
            console.error('Ошибка при удалении продукта из корзины:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
}

module.exports = new BasketController();
