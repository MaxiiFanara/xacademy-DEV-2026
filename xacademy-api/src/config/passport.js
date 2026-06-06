import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { UsuarioModel } from '../db/models/index.js';

const cookieExtractor = (req) => {
  if (!req) return null;
  return req.signedCookies?.access_token || req.cookies?.access_token || null;
};

passport.use('jwt', new JwtStrategy(
  { jwtFromRequest: cookieExtractor, secretOrKey: process.env.JWT_SECRET },
  async (payload, done) => {
    try {
      const user = await UsuarioModel.findOne({ where: { Email: payload.email } });
      if (!user) return done(null, false, { message: 'Usuario no encontrado' });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

export default passport;