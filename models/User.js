const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    cartItems: [cartItemSchema],
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
