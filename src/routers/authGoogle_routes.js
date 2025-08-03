import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Ruta para iniciar autenticación con Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Ruta de callback después de autenticar con Google
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/'}),
    (req, res) => {
        res.json({
        msg: 'Autenticado con Google',
        jefe: req.user.envBoss,
        token: req.user.tokenIngreso,
        });
    }
);

export default router;
