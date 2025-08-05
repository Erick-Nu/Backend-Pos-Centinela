import { Router } from 'express';
import {
    createNegocio,
    addEmployee,
    deleteNegocio,
    listNegocios
} from '../controllers/negocio_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Rutas privadas para negocios
router.post('/negocio/create', verifyTokenJWT, createNegocio);
router.post('/negocio/add-employee', verifyTokenJWT, addEmployee);
router.delete('/negocio/delete', verifyTokenJWT, deleteNegocio);
router.get('/negocio/list', verifyTokenJWT, listNegocios);


export default router;