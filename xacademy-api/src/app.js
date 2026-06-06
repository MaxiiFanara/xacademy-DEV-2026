import express from 'express';
 
import helmet from 'helmet';
 
import compression from 'compression';
 
import cookieParser from 'cookie-parser';
 
import cors from 'cors';
 
import passport from './config/passport.js';
 
import { silentRefresh } from './middleware/auth.js';
 
import indexRoutes from './routes/index.js';

import { env } from './config/env.js';

import { swaggerSpec, swaggerUi } from './config/swagger.js';
 
import path from 'path';
 
import { fileURLToPath } from 'url';
 
const __filename = fileURLToPath(import.meta.url);
 
const __dirname = path.dirname(__filename);
 
const app = express();
 
app.use(cors({
 
  origin: 'http://localhost:4200',
 
  credentials: true,
 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
 
  allowedHeaders: ['Content-Type', 'Authorization']
 
}));
 
app.use(helmet({
 
  crossOriginResourcePolicy: { policy: 'cross-origin' }
 
}));
 
app.use(compression({
 
  brotli: {
 
    enabled: true,
 
    zlib: {}
 
  }
 
}));
 
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
 
app.use(cookieParser(env.COOKIE_SECRET));
 
app.use(passport.initialize());
 
app.use(silentRefresh);

app.use('/img', express.static(path.join(__dirname, '../img')));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', indexRoutes);

export default app;
