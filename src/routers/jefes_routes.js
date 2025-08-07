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
    updatePassword,
    pagoPlan
} from '../controllers/jefe_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Rutas privadas para jefes
router.get('/boss/perfil', verifyTokenJWT, perfilBoss);
router.put('/boss/perfil/update', verifyTokenJWT, updatePerfil);
router.put('/boss/perfil/update/password', verifyTokenJWT, updatePassword);
router.post('/boss/pago/plan', verifyTokenJWT, pagoPlan);


// Rutas públicas para jefes
router.post('/boss/register', registerBoss);
router.get('/boss/confirm/:token', confirmEmail);
router.post('/boss/consulta/cedula', consultaCedula);
router.post('/boss/password/recover', recoverPassword);
router.get('/boss/password/verify/:token', comprobarTokenPasword);
router.post('/boss/password/reset/:token', createNewPassword);
router.post('/boss/login', loginBoss);


export default router;
