import { Router } from 'express';
import {
    registerEmployee,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPasword,
    createNewPassword,
    loginEmployee,
    perfilEmployee,
    updatePerfil,
    updatePassword

} from '../controllers/empleado_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

//Rutas para privadas para empleados
router.get('/employees/perfil', verifyTokenJWT, perfilEmployee);
router.put('/employees/update', verifyTokenJWT, updatePerfil);
router.put('/employees/update/password', verifyTokenJWT, updatePassword);


//Rutas publicas para empleados
router.post('/employees/register', registerEmployee);
router.get('/employees/confirm/:token', confirmEmail);
router.post('/employees/password/recover', recuperarPassword);
router.get('/employees/password/verify/:token', comprobarTokenPasword);
router.post('/employees/password/reset/:token', createNewPassword);
router.post('/employees/login', loginEmployee);

export default router;