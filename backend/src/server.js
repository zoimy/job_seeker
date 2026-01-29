import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import { globalLimiter, corsOptions } from './config/security.js';
import { errorHandler } from './utils/errorHandler.js';
import { validateEnv } from './utils/envValidation.js';

// Routes
import profileRoutes from './routes/profile.js';
import scrapeRoutes from './routes/scrape.js';
import notificationRoutes from './routes/notifications.js';
import integrationRoutes from './routes/integrations.js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Validate Environment
validateEnv();

// Connect to MongoDB
// Connect to MongoDB
connectDB();

// Start Notification Scheduler
import { notificationScheduler } from './services/notificationScheduler.js';
notificationScheduler.start();

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline often needed for some dev tools, refine for prod
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:3000"],
    },
  },
})); // Set security HTTP headers
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

// Health check endpoint (for monitoring and keep-alive)
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  // Check if this is a keep-alive ping (from GitHub Actions or monitoring service)
  const userAgent = req.get('user-agent') || '';
  const isKeepAlivePing = userAgent.includes('curl') || userAgent.includes('github-actions');
  
  // Log keep-alive pings (but not too verbose)
  if (isKeepAlivePing) {
    console.log(`[Keep-Alive] Ping received at ${new Date().toISOString()}`);
  }
  
  // Get notification scheduler status
  const schedulerStatus = notificationScheduler.isRunning ? 'running' : 'stopped';
  const lastCheck = notificationScheduler.lastCheckTime || null;
  
  // If DB is down, return 503 Service Unavailable
  const status = dbStatus === 'connected' ? 200 : 503;
  
  res.status(status).json({ 
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database: dbStatus,
    scheduler: {
      status: schedulerStatus,
      lastCheck: lastCheck
    },
    uptime: process.uptime()
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
