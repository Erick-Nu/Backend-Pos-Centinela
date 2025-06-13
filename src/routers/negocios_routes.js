import { Router } from 'express';
import {
    createNegocio,
    addEmployee
} from '../controllers/negocio_controller.js';

const router = Router();

router.post('/negocio/create', createNegocio);
router.post('/negocio/add-employee', addEmployee);

export default router;