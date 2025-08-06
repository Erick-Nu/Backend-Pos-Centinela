import { Router } from 'express';
import {
    createNegocio,
    addEmployee,
    deleteEmployee,
    deleteNegocio,
    listNegocios,
    detalleNegocio,
    reportEmployee,
    listReport,
    listEmployeesReport
} from '../controllers/negocio_controller.js';
import { verifyTokenJWT } from '../middlewares/JWT.js';

const router = Router();

// Rutas privadas para negocios
router.post('/negocios/create', verifyTokenJWT, createNegocio);
router.post('/negocios/add-employee', verifyTokenJWT, addEmployee);
router.get('/negocios/list', verifyTokenJWT, listNegocios);
router.get('/negocios/detail/:negocioId', verifyTokenJWT, detalleNegocio);
router.delete('/negocios/delete/:negocioId', verifyTokenJWT, deleteNegocio);
router.delete('/negocios/delete-employee/:employeeId', verifyTokenJWT, deleteEmployee);
router.get('/negocios/report/employee/:empleadoId', verifyTokenJWT, listEmployeesReport);
router.get('/negocios/report/:negocioId', verifyTokenJWT, listReport);
router.post('/negocios/report/:empleadoId/:negocioId', verifyTokenJWT, reportEmployee);


export default router;