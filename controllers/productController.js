const Product = require('../models/Product.js');

const createProduct = async (req, res) => {
    try {
        const { name, description, price, countInStock, imageUrl, category } = req.body;

        const product = new Product({
            name,
            description,
            price,
            countInStock,
            imageUrl,
            category,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
};