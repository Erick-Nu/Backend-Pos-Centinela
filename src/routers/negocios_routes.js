import { Router } from 'express';
import {
    createNegocio,
    addEmployee
} from '../controllers/negocio_controller.js';

const router = Router();

router.post('/negocios/create', createNegocio);
router.post('/negocios/add-employee', addEmployee);

export default router;