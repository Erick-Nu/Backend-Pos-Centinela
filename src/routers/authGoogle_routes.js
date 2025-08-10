import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Ruta para iniciar autenticación con Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Ruta de callback después de autenticar con Google
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/'}),
    (req, res) => {
        const redirectUrl = `${process.env.URL_FRONTEND}/auth/google/callback?token=${req.user.tokenIngreso}&user=${req.user.envBoss}`;
        console.log("Redirigiendo a:", redirectUrl);
        res.redirect(redirectUrl);
    }
);

export default router;
