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
app.use(express.json());

// 🟢 Robust CORS Configuration for Vercel/Production
const whiteList = [
  'http://localhost:3000',
  'https://arihant-seven.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow non-browser requests (like mobile apps/Postman)
    if (!origin) return callback(null, true);

    // 2. Allow anything from Vercel subdomains + localhost
    const isVercel = origin.endsWith('.vercel.app');
    const isLocal = origin.startsWith('http://localhost:');
    const isWhiteListed = whiteList.includes(origin);

    if (isVercel || isLocal || isWhiteListed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error('Cross-Origin Request Blocked'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS globally
app.use(cors(corsOptions));
// Handle Preflight (OPTIONS) requests immediately
app.options('*', cors(corsOptions));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/uniform-items', uniformItemRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', require('./routes/admin'));

// Root Health check (for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Detailed API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date(), environment: process.env.NODE_ENV || 'development' });
});

app.get('/', (req, res) => {
  res.send('Arihant Store API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
