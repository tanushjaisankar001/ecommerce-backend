const Order = require('../models/Order.js');
const User = require('../models/User.js');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const createOrder = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user && user.cartItems.length > 0) {
        const { shippingAddress } = req.body;

        const totalPrice = user.cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

        const order = new Order({
            user: req.user._id,
            orderItems: user.cartItems,
            shippingAddress,
            totalPrice,
        });

        const createdOrder = await order.save();
        
        user.cartItems = [];
        await user.save();

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: totalPrice * 100, // Amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: createdOrder._id.toString(),
        };

        instance.orders.create(options, function(err, razorpayOrder) {
            if (err) {
                return res.status(500).json({ message: "Something Went Wrong" });
            }
            res.status(201).json({ order: createdOrder, razorpayOrder });
        });

    } else {
        res.status(400).json({ message: 'No items in cart' });
    }
};

const verifyPayment = async (req, res) => {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const sign = orderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");
    
    if (razorpaySignature === expectedSign) {
        const order = await Order.findOne({ "razorpay.orderId": orderId });
        
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.razorpay.paymentId = razorpayPaymentId;
            order.razorpay.signature = razorpaySignature;

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } else {
        res.status(400).json({ message: "Invalid signature" });
    }
};

module.exports = { createOrder, verifyPayment };