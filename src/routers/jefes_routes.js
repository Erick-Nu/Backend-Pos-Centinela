import { Router } from 'express';
import {
    consultaCedula,
    registerBoss,
    confirmEmail,
    recoverPassword,
    comprobarTokenPasword,
    createNewPassword,
    loginBoss,
    perfilBoss,
    updatePerfil,
    updatePassword
} from '../controllers/jefe_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Rutas privadas para jefes
router.get('/boss/perfil', verifyTokenJWT, perfilBoss);
router.put('/boss/perfil/update', verifyTokenJWT, updatePerfil);
// Enviar un mesaje informando del cambio de contraseña
router.put('/boss/perfil/update/password', verifyTokenJWT, updatePassword);



// Rutas públicas para jefes
router.post('/boss/register', registerBoss);
router.get('/boss/confirm/:token', confirmEmail);
router.post('/boss/consulta/cedula', consultaCedula);
router.post('/boss/password/recover', recoverPassword);
router.get('/boss/password/verify/:token', comprobarTokenPasword);
router.post('/boss/password/reset/:token', createNewPassword);
router.post('/boss/login', loginBoss);


export default router;
