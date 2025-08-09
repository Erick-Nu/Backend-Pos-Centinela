import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Boss from '../models/jefes.js';
import { createTokenJWT } from '../middlewares/JWT.js';
import dotenv from 'dotenv';
dotenv.config();

const generateRandomPassword = (length = 12) =>
  Array.from({ length }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&*'.charAt(Math.floor(Math.random() * 72))).join('');

const authGoogle = async (accessToken, refreshToken, profile, done) => {
  try {
    let boss = await Boss.findOne({ email: profile.emails[0].value });
    if (!boss) {
      const rawPassword = generateRandomPassword();
      boss = new Boss({
        nombres: profile.name?.givenName || '',
        apellidos: profile.name?.familyName || '',
        email: profile.emails[0].value,
        cedula: Date.now().toString().slice(-10),
        password: await Boss.prototype.encrypPassword(rawPassword),
        confirmEmail: true,
        rol: 'jefe',
      });
      await boss.save();
    }

    const tokenIngreso = createTokenJWT(boss.id, boss.rol);
    const { password, __v, createdAt, updatedAt, token, isDeleted, confirmEmail, ...envBoss } = boss.toObject();
    return done(null, { envBoss, tokenIngreso });
  } catch (error) {
    console.error('Error autenticando con Google:', error);
    return done(error, null);
  }
};

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.URL_BACKEND_PRODUCTION}/api/auth/google/callback`,
}, authGoogle));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
