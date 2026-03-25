const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const schoolRoutes = require('./routes/schools');
const standardRoutes = require('./routes/standards');
const uniformItemRoutes = require('./routes/uniformItems');
const addressRoutes = require('./routes/addresses');
const cartRoutes = require('./routes/carts');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5051;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/uniform-items', uniformItemRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Arihant Store API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
