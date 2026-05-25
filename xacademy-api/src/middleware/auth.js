import passport    from '../config/passport.js';
import authService from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  signed:   true,                                          // ← firmadas
  secure:   process.env.NODE_ENV === 'production',
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('access_token',  accessToken,  { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
};
/*
// Renueva silenciosamente si el access expiró pero el refresh es válido
export const silentRefresh = async (req, res, next) => {
  const accessToken  = req.signedCookies.access_token;
  const refreshToken = req.signedCookies.refresh_token;

  if (accessToken) return next(); // access válido, no hace nada

  if (!refreshToken) return next(); // no hay sesión activa

  try {
    const { accessToken: newAccess, refreshToken: newRefresh } = await authService.refreshFromToken(refreshToken);
    setTokenCookies(res, newAccess, newRefresh);
    req.cookies.access_token = newAccess; // lo inyectamos para que passport lo lea en este mismo request
  } catch {
    // refresh expirado o inválido, limpiamos y dejamos pasar (requireAuth lo bloqueará si la ruta lo exige)
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  next();
};
*/

export const silentRefresh = async (req, res, next) => {
  try {
    const accessToken  = req.signedCookies?.access_token;
    const refreshToken = req.signedCookies?.refresh_token;

    if (accessToken) return next();
    if (!refreshToken) return next();

    const { accessToken: newAccess, refreshToken: newRefresh } = await authService.refreshFromToken(refreshToken);
    setTokenCookies(res, newAccess, newRefresh);
    req.cookies.access_token = newAccess;
  } catch {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  next();
};

// Rutas que requieren sesión activa
export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err)   return next(err);
    if (!user) return res.status(401).json({ error: 'Autenticación requerida' });
    req.user = user;
    next();
  })(req, res, next);
};

// Bloquea si ya está logueado (para login/register)
export const alreadyAuth = (req, res, next) => {
  if (!req.signedCookies?.access_token) return next();
  res.status(400).json({ error: 'Ya tenés una sesión activa' });
};

export { setTokenCookies };