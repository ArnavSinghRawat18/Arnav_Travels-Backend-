const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = () => {
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
    if (!uri) {
        const msg = 'DATABASE_URL or MONGODB_URI is not set in environment';
        console.error(msg);
        return Promise.reject(new Error(msg));
    }

    console.log('Attempting to connect to MongoDB...');
    
    // Increased timeout and added retry options for better connection handling
    return mongoose
        .connect(uri, {
            serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
            socketTimeoutMS: 45000,
            tls: true,
            retryWrites: true,
            maxPoolSize: 10,
        })
        .then(() => {
            console.log('MongoDB: connected successfully');
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err.message || err);
            console.error('Connection URI (masked):', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
            
            // Log specific error types to help with debugging
            if (err.message.includes('IP')) {
                console.error('💡 Tip: Check if your IP is whitelisted in MongoDB Atlas Network Access');
            }
            if (err.message.includes('SSL') || err.message.includes('TLS')) {
                console.error('💡 Tip: SSL/TLS connection issue - check your connection string and network');
            }
            
            throw err;
        });
};

module.exports = connectDB;