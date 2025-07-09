import { Router } from 'express';
import {
    registroAdmin,
    confirmarMail,
    updateFace,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    loginAdmin,
    perfilAdmin,
    updatePerfil,
    updatePassword,
    listAdmins
} from '../controllers/admin_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Rutas privadas para administradores
router.post('/admins/register', verifyTokenJWT, registroAdmin);
router.get('/admins/perfil', verifyTokenJWT, perfilAdmin);
router.put('/admins/update/:id', verifyTokenJWT, updatePerfil);
router.put('/admins/update/password', verifyTokenJWT, updatePassword);
router.get('/admins/list', verifyTokenJWT, listAdmins);

// Rutas públicas para administradores
router.get('/admins/confirm/:token', confirmarMail);
router.post('/admins/password/recover', recuperarPassword);
router.get('/admins/password/verify/:token', comprobarTokenPasword);
router.post('/admins/password/reset/:token', crearNuevoPassword);
router.post('/admins/login', loginAdmin);

export default router;
