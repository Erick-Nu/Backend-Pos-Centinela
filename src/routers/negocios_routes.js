import { Router } from 'express';
import {
    createNegocio,
} from '../controllers/negocio_controller.js';

const router = Router();

router.post('/negocios/create', createNegocio);

export default router;