const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/orderController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, createOrder);
router.route('/verify-payment').post(protect, verifyPayment);

module.exports = router;
