import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';

const app: Application = express();

// CORS configuration
app.use(cors({
    origin: config.frontend_url || 'http://localhost:3000',
    credentials: true
}));

// Parser
// Exclude webhook endpoint from JSON parser (needs raw body for Stripe signature verification)
app.use((req, res, next) => {
  if (req.path === '/api/v1/subscriptions/webhook') {
    // Skip JSON parsing for webhook endpoint
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/v1", router);

// Root route
app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Travel Buddy Backend Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    })
});

// Error handling middleware (must be last)
app.use(globalErrorHandler);
app.use(notFound);

export default app;

