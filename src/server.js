// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import routerAdministradores from './routers/admin_routes.js';
import routerEmpleados from './routers/empleados_routes.js';
import routerJefes from './routers/jefes_routes.js';
import routerNegocios from './routers/negocios_routes.js';

// Inicializaciones
const app = express()
// Carga las variables definidas en el archivo .env al process.env.
dotenv.config()

// Configuraciones 
app.set('port',process.env.PORT || 3000)
// Permite que cualquier dominio acceda al servidor
app.use(cors())

// Middlewares 
// Este middleware permite que el servidor pueda recibir datos en formato JSON
app.use(express.json())


// Variables globales


// Ruta principal y de las cuales se derivan las demás
// Ruta principal mejorada con HTML y CSS
app.get('/', (req, res) => {
    res.send(`
    <html>
        <head>
        <title>🚀 API POS CENTINELA</title>
        <style>
            body {
            background-color: #0f172a;
            color: #facc15;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            }
            h1 {
            font-size: 3rem;
            margin: 0;
            }
            p {
            font-size: 1.2rem;
            margin-top: 10px;
            color: #94a3b8;
            }
            .emoji {
            font-size: 4rem;
            animation: spin 2s infinite linear;
            }
            @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
            }
        </style>
        </head>
        <body>
        <div class="emoji">🛒</div>
        <h1>POS CENTINELA API</h1>
        <p>🚀 Server Running Successfully 🚀</p>
        </body>
    </html>
    `);
});


// Rutas para administradores
app.use('/api',routerAdministradores)

// Rutas para empleados
app.use('/api', routerEmpleados);

// Rutas para jefes
app.use('/api', routerJefes);

// Rutas para negocios
app.use('/api', routerNegocios);

// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))


// Exportar la instancia de express por medio de app
export default  app