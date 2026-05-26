import express    from 'express';
import helmet     from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import passport   from './config/passport.js';
import { silentRefresh } from './middleware/auth.js';
import indexRoutes from './routes/index.js';
import { env }    from './config/env.js';

const app = express();

app.use(helmet());
app.use(compression({ brotli: { enabled: true, zlib: {} } }));
app.use(express.json());  
app.use((req, res, next) => {
  console.log('METHOD:', req.method);
  console.log('PATH:', req.path);
  console.log('BODY:', req.body);
  next();
});                        // ← después de helmet
app.use(express.urlencoded({ extended: true }));  // ← después de helmet
app.use(cookieParser(env.COOKIE_SECRET));
app.use(passport.initialize());
app.use(silentRefresh);
app.use((req, res, next) => {
  console.log('LLEGÓ DESPUÉS DE SILENT REFRESH'); // ← agregá esto
  next();
});
app.use('/api', indexRoutes);
app.use('/api', indexRoutes);

export default app;