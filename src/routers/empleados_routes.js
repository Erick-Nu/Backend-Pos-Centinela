import { Router } from 'express';
import {
    registerEmployee,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPasword,
    createNewPassword
} from '../controllers/empleado_controller.js';

const router = Router();

router.post('/employees/register', registerEmployee);
router.get('/employees/confirm/:token', confirmEmail);
router.post('/employees/password/recover', recuperarPassword);
router.get('/employees/password/verify/:token', comprobarTokenPasword);
router.post('/employees/password/reset/:token', createNewPassword);

export default router;