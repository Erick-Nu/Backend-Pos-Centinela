import { Router } from 'express';
import {
    registroAdmin,
    confirmarMail,
    updateFace,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    loginAdmin
} from '../controllers/admin_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Rutas privadas para administradores
router.post('/admins/register', verifyTokenJWT, registroAdmin);
router.put('/admins/update', verifyTokenJWT, updateFace);

// Rutas públicas para administradores
router.get('/admins/confirm/:token', confirmarMail);
router.post('/admins/password/recover', recuperarPassword);
router.get('/admins/password/verify/:token', comprobarTokenPasword);
router.post('/admins/password/reset/:token', crearNuevoPassword);
router.post('/admins/login', loginAdmin);

export default router;
