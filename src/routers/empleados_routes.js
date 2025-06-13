import { Router } from 'express';
import {
    registerEmployee,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPasword,
    createNewPassword,
    loginEmployee
} from '../controllers/empleado_controller.js';

const router = Router();

router.get('/employees/register', (req, res) => {
    res.status(200).json({msg:"Bienvenido Empleado, completa tu resgistro para empezar a trabajar"});
});
router.post('/employees/register', registerEmployee);
router.get('/employees/confirm/:token', confirmEmail);
router.post('/employees/password/recover', recuperarPassword);
router.get('/employees/password/verify/:token', comprobarTokenPasword);
router.post('/employees/password/reset/:token', createNewPassword);
router.post('/employees/login', loginEmployee);

export default router;