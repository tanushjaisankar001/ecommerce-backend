const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyOrders, getOrders } = require('../controllers/orderController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/verify-payment').post(protect, verifyPayment);

module.exports = router;
