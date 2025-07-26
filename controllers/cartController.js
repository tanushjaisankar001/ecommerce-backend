const User = require('../models/User.js');
const Product = require('../models/Product.js');

const getCart = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json(user.cartItems);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const addToCart = async (req, res) => {
    const { productId, qty } = req.body;
    const user = await User.findById(req.user._id);
    const product = await Product.findById(productId);

    if (user && product) {
        const existItem = user.cartItems.find(x => x.product.toString() === product._id.toString());

        if (existItem) {
            existItem.qty = qty;
        } else {
            const cartItem = {
                product: product._id,
                name: product.name,
                qty,
                price: product.price,
                imageUrl: product.imageUrl,
            };
            user.cartItems.push(cartItem);
        }

        await user.save();
        res.status(201).json(user.cartItems);
    } else {
        res.status(404).json({ message: 'User or Product not found' });
    }
};

const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (user) {
        user.cartItems = user.cartItems.filter(x => x.product.toString() !== productId);
        await user.save();
        res.json(user.cartItems);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { getCart, addToCart, removeFromCart };