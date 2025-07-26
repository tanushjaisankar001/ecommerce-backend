const Order = require('../models/Order.js');
const User = require('../models/User.js');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');

const getShiprocketToken = async () => {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
    });
    return response.data.token;
};

const createShipment = async (order, user) => {
    const token = await getShiprocketToken();
    const orderItems = order.orderItems.map(item => ({
        name: item.name,
        sku: item.product.toString(),
        units: item.qty,
        selling_price: item.price,
    }));
    const shipmentData = {
        order_id: order._id.toString(),
        order_date: order.createdAt.toISOString().slice(0, 10),
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
        billing_customer_name: user.name,
        billing_last_name: "",
        billing_address: order.shippingAddress.address,
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.postalCode,
        billing_state: "Karnataka",
        billing_country: order.shippingAddress.country,
        billing_email: user.email,
        billing_phone: "9876543210",
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: "Prepaid",
        shipping_charges: 0,
        total_discount: 0,
        sub_total: order.totalPrice,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
    };
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    const { data } = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', shipmentData, config);
    if (data.status_code === 422 || data.message) {
        throw new Error(data.message || 'Shiprocket API returned an error.');
    }
    return data;
};

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
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const options = {
            amount: totalPrice * 100,
            currency: "INR",
            receipt: createdOrder._id.toString(),
        };
        const razorpayOrder = await instance.orders.create(options);
        createdOrder.razorpay.orderId = razorpayOrder.id;
        await createdOrder.save();
        user.cartItems = [];
        await user.save();
        res.status(201).json({ order: createdOrder, razorpayOrder });
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
        const user = await User.findById(order.user);
        
        if (order && user) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.razorpay.paymentId = razorpayPaymentId;
            order.razorpay.signature = razorpaySignature;
            try {
                const shipmentDetails = await createShipment(order, user);
                order.shipment.shiprocketOrderId = shipmentDetails.order_id;
                order.shipment.shipmentId = shipmentDetails.shipment_id;
                order.shipment.status = shipmentDetails.status;
            } catch (error) {
                console.error("Shiprocket API Error:", error.message);
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order or User not found' });
        }
    } else {
        res.status(400).json({ message: "Invalid signature" });
    }
};

module.exports = { createOrder, verifyPayment };