// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import routerAdministradores from './routers/admin_routes.js';
import routerEmpleados from './routers/empleados_routes.js';
import routerJefes from './routers/jefes_routes.js';
import routerNegocios from './routers/negocios_routes.js';
import cloudinary from 'cloudinary'
import fileUpload from "express-fileupload"
import session from 'express-session';
import passport from 'passport';
import routerAuthGoogle from './routers/authGoogle_routes.js';
import './config/passport_google.js';
// Hacer uso de la configuración de Passport para Google OAuth
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

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}));

// Sesión (requerida por Passport)
app.use(session({
    secret: 'mi_secreto',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Rutas de Google OAuth
app.use('/api', routerAuthGoogle);

// Variables globales


// Ruta principal y de las cuales se derivan las demás
// Ruta principal mejorada con HTML y CSS
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>🚀 API POS CENTINELA</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f2f4f8; margin: 0; padding: 0;">

                <div style="max-width: 600px; margin: 50px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e0e0e0;">

                    <!-- Encabezado -->
                    <div style="background-color: #1abc9c; padding: 32px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px; color: #ffffff;">POS CENTINELA</h1>
                        <p style="margin-top: 10px; font-size: 16px; color: #e6f9f7; font-style: italic;">Monitorea. Aprende. Mejora.</p>
                    </div>

                    <!-- Imagen -->
                    <div style="text-align: center; padding: 24px;">
                        <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWV6eHZycTNlejV4Y2MxMDk2aGNzZjBkdDFsZWc3NGR1NHdwa29iMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gYZ7qO81g4dt6/giphy.gif"
                            alt="Sticker animado"
                            style="width: 280px; max-width: 100%; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);" />
                    </div>

                    <!-- Cuerpo -->
                    <div style="padding: 0 32px 40px;">
                        <h2 style="color: #2d3748; text-align: center; font-size: 22px; margin-bottom: 20px;">
                            ¡Bienvenido a <span style="color:#1abc9c;">POS CENTINELA</span>!
                        </h2>

                        <p style="font-size: 16px; color: #4a5568; text-align: center; line-height: 1.6; margin: 0 0 30px;">
                            🚀 La API de monitoreo está <strong>activa</strong> y funcionando correctamente. Estamos listos para trabajar contigo.
                        </p>

                        <div style="text-align: center;">
                            <a href="https://github.com/Erick-Nu/Backend-Pos-Centinela" 
                                target="_blank"
                                style="background-color: #1abc9c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: background 0.3s ease;">
                                🌐 Ver Proyecto en GitHub
                            </a>
                        </div>
                    </div>

                    <!-- Pie -->
                    <div style="border-top: 1px solid #e2e8f0; background-color: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 13px;">
                        🤖 El equipo de <strong style="color:#2d3748;">POS CENTINELA</strong> está feliz de tenerte con nosotros.<br>
                        <em>Monitorea. Aprende. Mejora.</em>
                    </div>
                </div>

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