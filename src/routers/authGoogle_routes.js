import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Ruta para iniciar autenticación con Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Ruta de callback después de autenticar con Google
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/'}),
    (req, res) => {
        console.log("Usuario autenticado:", req.user);
        if (!req.user) {
            return res.redirect(`${process.env.URL_FRONTEND}/login`);
        }
        const user = encodeURIComponent(JSON.stringify(req.user));
        const redirectUrl = `${process.env.URL_FRONTEND}/auth/google/callback?token=${req.user.tokenIngreso}&user=${user}`;
        console.log("Redirigiendo a:", redirectUrl);
        res.redirect(redirectUrl);
    }
);

export default router;
