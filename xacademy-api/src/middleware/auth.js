import passport    from '../config/passport.js';
import authService from '../services/auth.service.js';
import { verifyToken } from '../utils/jwt.js';
import {setTokenCookies} from '../utils/cookies.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  signed:   process.env.NODE_ENV === 'production',
  secure:   process.env.NODE_ENV === 'production',
};
export const silentRefresh = async (req, res, next) => {
  try {
    const accessToken  = req.signedCookies?.access_token || req.cookies?.access_token;
    const refreshToken = req.signedCookies?.refresh_token || req.cookies?.refresh_token;

    if (!refreshToken) return next();

    if (accessToken) {
      const payload = verifyToken(accessToken);
      if (payload) return next();
    }

    const { accessToken: newAccess, refreshToken: newRefresh } = await authService.refreshFromToken(refreshToken);
    setTokenCookies(res, newAccess, newRefresh);
    req.signedCookies.access_token = newAccess;
  } catch {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
  next();
};

export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err)   return next(err);
    if (!user) return res.status(401).json({ error: 'Autenticación requerida' });
    req.user = user;
    next();
  })(req, res, next);
};

export const alreadyAuth = (req, res, next) => {
  const token = req.signedCookies?.access_token || req.cookies?.access_token;
  if (!token) return next();
  res.status(400).json({ error: 'Ya tenés una sesión activa' });
};