import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import patientRoutes from './routes/patientRoutes';
import policyRoutes from './routes/policyRoutes';
import documentRoutes from './routes/documentRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import journeyRoutes from './routes/journeyRoutes';
import verificationRoutes from './routes/verificationRoutes';
import costRoutes from './routes/costRoutes';
import aiRoutes from './routes/aiRoutes';
import scenarioRoutes from './routes/scenarioRoutes';
import { checkSupabaseConnection } from './config/supabase';
import { dataRepository } from './services/dataRepository';
import { dbManager } from './db/dbManager';
import { optionalAuth } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Serverless cold-start initialization middleware
let initPromise: Promise<void> | null = null;
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!initPromise) {
    initPromise = dbManager.initializeOnStartup().catch((err) => {
      console.warn('Database init notice:', err?.message || err);
    });
  }
  await initPromise;
  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 🌟 Root API Index & Live Verification Pings
app.get(['/', '/api'], async (req: Request, res: Response) => {
  const dbStatus = await checkSupabaseConnection();
  res.json({
    success: true,
    data: {
      service: 'CareIQ Decision-Support Backend API',
      status: 'ONLINE',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      aiEngine: {
        provider: 'Google Gemini AI',
        configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
      },
      database: {
        provider: 'Supabase PostgreSQL',
        connected: dbStatus.connected,
        tablesAvailable: dbStatus.tablesAvailable,
        isDatabaseSynced: dataRepository.getIsDatabaseSynced(),
        message: dbStatus.message
      },
      quickTestEndpoints: {
        healthCheck: '/api/health',
        hospitalMatchSample: '/api/hospitals/match?city=Bengaluru',
        demoProfiles: '/api/onboarding/demo-profiles',
        clinicalScenarios: '/api/scenarios'
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const dbStatus = await checkSupabaseConnection();
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'CareIQ Decision-Support Backend API',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
      database: {
        provider: 'Supabase PostgreSQL',
        connected: dbStatus.connected,
        tablesAvailable: dbStatus.tablesAvailable,
        isDatabaseSynced: dataRepository.getIsDatabaseSynced(),
        message: dbStatus.message
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/patients', optionalAuth, patientRoutes);
app.use('/api/policies', optionalAuth, policyRoutes);
app.use('/api/documents', optionalAuth, documentRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/journeys', optionalAuth, journeyRoutes);
app.use('/api/verification-items', optionalAuth, verificationRoutes);
app.use('/api/cost', costRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/scenarios', scenarioRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal error occurred'
    }
  });
});

if (process.env.NODE_ENV !== 'test' && (!process.env.TEST_MODE || process.env.TEST_MODE !== 'true')) {
  app.listen(port, async () => {
    console.log(`CareIQ Backend Server is listening on http://localhost:${port}`);
    await dbManager.initializeOnStartup();
  });
}

export default app;
