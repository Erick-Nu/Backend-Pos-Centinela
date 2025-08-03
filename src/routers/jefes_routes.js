import { Router } from 'express';
import {
    consultaCedula,
    registerBoss,
    confirmEmail,
    recoverPassword,
    comprobarTokenPasword,
    createNewPassword,
    loginBoss
} from '../controllers/jefe_controller.js';

const router = Router();

router.post('/boss/consulta/cedula', consultaCedula);
router.post('/boss/register', registerBoss);
router.get('/boss/confirm/:token', confirmEmail);
router.post('/boss/password/recover', recoverPassword);
router.get('/boss/password/verify/:token', comprobarTokenPasword);
router.post('/boss/password/reset/:token', createNewPassword);
router.post('/boss/login', loginBoss);

export default router;
