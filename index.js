const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
