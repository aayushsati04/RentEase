const mongoose = require('mongoose');
const { URL, URLSearchParams } = require('url');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb+srv://aayush:bhanu0704@aayushsati.e62qqm9.mongodb.net/rentease?retryWrites=true&w=majority';
    
    // Sanitize connection URI to filter out unsupported MongoDB options but keep appname
    if (uri.startsWith('mongodb')) {
      try {
        const parsedUrl = new URL(uri);
        const cleanParams = new URLSearchParams();
        
        // Keep only standard allowed MongoDB connection parameters
        const allowedParams = ['retrywrites', 'w', 'authsource', 'ssl', 'replicaset', 'maxpoolsize', 'minpoolsize', 'appname'];
        for (const [key, value] of parsedUrl.searchParams.entries()) {
          if (allowedParams.includes(key.toLowerCase())) {
            cleanParams.set(key, value);
          }
        }
        
        parsedUrl.search = cleanParams.toString();
        uri = parsedUrl.toString();
      } catch (parseErr) {
        console.warn('Sanitization warning: Using fallback URI');
        uri = 'mongodb+srv://aayush:bhanu0704@aayushsati.e62qqm9.mongodb.net/rentease?retryWrites=true&w=majority';
      }
    }

    const conn = await mongoose.connect(uri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      }
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
