import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import { silentRefresh } from './middleware/auth.js';
import indexRoutes from './routes/index.js';
import { env } from './config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // ← permite servir imágenes a otros orígenes
}));
app.use(compression({ brotli: { enabled: true, zlib: {} } }));
app.use(express.json());
app.use((req, res, next) => {
  console.log('METHOD:', req.method);
  console.log('PATH:', req.path);
  console.log('BODY:', req.body);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(passport.initialize());
app.use(silentRefresh);
app.use((req, res, next) => {
  console.log('LLEGÓ DESPUÉS DE SILENT REFRESH');
  next();
});

// Servir imágenes estáticas
app.use('/img', express.static(path.join(__dirname, '../img')));

app.use('/api', indexRoutes);

export default app;