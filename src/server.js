// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import routerAdministradores from './routers/admin_routes.js';
import routerEmpleados from './routers/empleados_routes.js';
import routerJefes from './routers/jefes_routes.js';

// Inicializaciones
const app = express()
// Carga las variables definidas en el archivo .env al process.env.
dotenv.config()

// Configuraciones 
app.set('port',process.env.port || 3000)
// Permite que cualquier dominio acceda al servidor
app.use(cors())

// Middlewares 
// Este middleware permite que el servidor pueda recibir datos en formato JSON
app.use(express.json())


// Variables globales


// Rutas 
app.get('/',(req,res)=>{
    res.send("Server on")
})

// Rutas para administradores
app.use('/api',routerAdministradores)

// Rutas para empleados
app.use('/api', routerEmpleados);

// Rutas para jefes
app.use('/api', routerJefes);

// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))


// Exportar la instancia de express por medio de app
export default  app