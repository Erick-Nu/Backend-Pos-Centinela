import { Router } from 'express';
import {
    createNegocio,
    addEmployee
} from '../controllers/negocio_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Rutas privadas para negocios
router.post('/negocio/create', verifyTokenJWT, createNegocio);
router.post('/negocio/add-employee', verifyTokenJWT, addEmployee);

export default router;