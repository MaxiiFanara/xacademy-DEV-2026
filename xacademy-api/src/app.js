import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import { silentRefresh } from './middleware/auth.js';
import indexRoutes  from './routes/index.js';
import {env} from './config/env.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression({ brotli: { enabled: true, zlib: {} } }));
app.use(cookieParser(env.COOKIE_SECRET));  // ← firma las cookies
app.use(passport.initialize());
app.use(silentRefresh);                             // ← refresh automático global

app.use('/api', indexRoutes);

export default app;