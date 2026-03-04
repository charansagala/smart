require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/database');

// Import routes
const destinationRoutes = require('./routes/destinations');
const tripRoutes = require('./routes/trips');
const analyticsRoutes = require('./routes/analytics');
const recommendationRoutes = require('./routes/recommendations');
const plannerRoutes = require('./routes/planner');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/plan-trip', plannerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Static assets (like uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SmartTour API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Serve Frontend Build in Production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    const publicPath = path.join(__dirname, '../client/dist');
    app.use(express.static(publicPath));

    // Catch-all route to serve the React index.html for any frontend route
    app.get('*', (req, res, next) => {
        // Skip if API route
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(publicPath, 'index.html'));
    });
}

// 404 handler for API or non-production
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// Start
const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 SmartTour API running at http://localhost:${PORT}`);
        console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    });
};

start();
