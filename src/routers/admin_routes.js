import { Router } from 'express';
import {
    registroAdmin,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    loginAdmin,
    perfilAdmin,
    updatePerfil,
    updatePassword,
    listAdmins,
    deleteAdmin,
    listBoss,
    deleteBoss
} from '../controllers/admin_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Rutas privadas para administradores
router.post('/admins/register', verifyTokenJWT, registroAdmin);
router.get('/admins/perfil', verifyTokenJWT, perfilAdmin);
router.put('/admins/perfil/update', verifyTokenJWT, updatePerfil);
router.put('/admins/perfil/update/password', verifyTokenJWT, updatePassword);
router.get('/admins/list', verifyTokenJWT, listAdmins);
router.get('/admins/detail/:id', verifyTokenJWT, detalleAdmin);
router.delete('/admins/delete/:id', verifyTokenJWT, deleteAdmin);
router.get('/admins/list/boss', verifyTokenJWT, listBoss);
router.delete('/admins/delete/boss/:id', verifyTokenJWT, deleteBoss);

// Rutas públicas para administradores
router.get('/admins/confirm/:token', confirmarMail);
router.post('/admins/password/recover', recuperarPassword);
router.get('/admins/password/verify/:token', comprobarTokenPasword);
router.post('/admins/password/reset/:token', crearNuevoPassword);
router.post('/admins/login', loginAdmin);

export default router;
