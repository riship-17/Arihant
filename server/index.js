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
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedPatterns = [
      /^https:\/\/arihant-.*\.vercel\.app$/,
      /^http:\/\/localhost:\d+$/
    ];
    
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin)) || 
                     origin === process.env.FRONTEND_URL ||
                     origin === 'https://arihant-seven.vercel.app';

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // Cache preflight for 24 hours
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
