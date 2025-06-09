import { Router } from 'express';
import {
    registerBoss,
    confirmEmail,
    recoverPassword,
    comprobarTokenPasword,
    createNewPassword
} from '../controllers/jefe_controller.js';

const router = Router();

router.post('/boss/register', registerBoss);
router.get('/boss/confirm/:token', confirmEmail);
router.post('/boss/password/recover', recoverPassword);
router.get('/boss/password/verify/:token', comprobarTokenPasword);
router.post('/boss/password/reset/:token', createNewPassword);

export default router;
