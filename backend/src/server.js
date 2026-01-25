import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import { globalLimiter, corsOptions } from './config/security.js';
import { errorHandler } from './utils/errorHandler.js';

// Routes
import profileRoutes from './routes/profile.js';
import scrapeRoutes from './routes/scrape.js';
import notificationRoutes from './routes/notifications.js';
import integrationRoutes from './routes/integrations.js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors(corsOptions)); // Secure CORS configuration
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use('/api', globalLimiter); // Rate limiting

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/integrations', integrationRoutes);

// Health check endpoint (for Fly.io)
app.get('/health', (req, res) => {
  // Check MongoDB connection connection locally without importing mongoose if possible,
  // or just return simple status. Given server.js context, we can import mongoose or rely on try/catch
  // For now simple reliable response
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  res.send('Job Tracker API is running');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
