import { Router } from 'express';
import {
    registroAdmin,
    confirmarMail,
    updateFace,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword
} from '../controllers/admin_controller.js';

const router = Router();

router.post('/admins/register', registroAdmin);
router.get('/admins/confirm/:token', confirmarMail);
router.put('/admins/update', updateFace);
router.post('/admins/password/recover', recuperarPassword);
router.get('/admins/password/verify/:token', comprobarTokenPasword);
router.post('/admins/password/reset/:token', crearNuevoPassword);

export default router;
