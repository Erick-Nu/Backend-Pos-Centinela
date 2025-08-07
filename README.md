# Backend-Pos-Centinela
API de Gestión de Negocios y Empleados
Este repositorio contiene la API para la gestión de administradores, jefes, empleados y negocios en un sistema. Permite a los jefes administrar sus negocios, empleados y reportes de productividad, mientras que los administradores gestionan las cuentas de los jefes y empleados.

Estructura del Proyecto
Controladores
Administrador (admin_controller.js): Contiene los controladores para la gestión de administradores (registro, autenticación, actualización de perfil, etc.).

Empleado (empleado_controller.js): Contiene los controladores para la gestión de empleados (registro, autenticación, perfil, etc.).

Jefe (jefe_controller.js): Contiene los controladores para la gestión de jefes (registro, perfil, pago del plan, etc.).

Negocio (negocio_controller.js): Contiene los controladores para la gestión de negocios (creación, actualización, eliminación, empleados, reportes, etc.).

Rutas
📁 Rutas del Administrador
Rutas Privadas

POST /admins/register: Registra un nuevo administrador.

GET /admins/perfil: Obtiene el perfil del administrador.

PUT /admins/perfil/update: Actualiza los datos del perfil del administrador.

PUT /admins/perfil/update/password: Actualiza la contraseña del administrador.

GET /admins/list: Lista todos los administradores.

GET /admins/detail/:id: Obtiene los detalles de un administrador.

DELETE /admins/delete/:id: Elimina un administrador.

PUT /admins/activate/:id: Reactiva un administrador eliminado.

GET /admins/list/boss: Lista todos los jefes registrados.

GET /admins/detail/boss/:id: Obtiene los detalles de un jefe.

Rutas Públicas

GET /admins/confirm/:token: Confirma la cuenta del administrador mediante un token.

POST /admins/password/recover: Recupera la contraseña del administrador.

GET /admins/password/verify/:token: Verifica el token para la recuperación de contraseña.

POST /admins/password/reset/:token: Restablece la contraseña del administrador.

POST /admins/login: Inicia sesión con las credenciales del administrador.

📁 Rutas del Empleado
Rutas Privadas

GET /employees/perfil: Obtiene el perfil del empleado.

PUT /employees/update: Actualiza el perfil del empleado.

PUT /employees/update/password: Actualiza la contraseña del empleado.

Rutas Públicas

POST /employees/register: Registra un nuevo empleado en el sistema.

GET /employees/confirm/:token: Confirma el email del empleado mediante un token.

POST /employees/password/recover: Recupera la contraseña del empleado.

GET /employees/password/verify/:token: Verifica el token para la recuperación de contraseña.

POST /employees/password/reset/:token: Restablece la contraseña del empleado.

POST /employees/login: Inicia sesión con las credenciales del empleado.

📁 Rutas del Jefe
Rutas Privadas

GET /boss/perfil: Obtiene el perfil del jefe.

PUT /boss/perfil/update: Actualiza el perfil del jefe.

PUT /boss/perfil/update/password: Actualiza la contraseña del jefe.

PUT /boss/pago/plan: Realiza el pago del plan y actualiza la suscripción.

Rutas Públicas

POST /boss/register: Registra un nuevo jefe en el sistema.

GET /boss/confirm/:token: Confirma la cuenta del jefe mediante un token.

POST /boss/consulta/cedula: Consulta la validez de una cédula.

POST /boss/password/recover: Recupera la contraseña del jefe.

GET /boss/password/verify/:token: Verifica el token para la recuperación de contraseña.

POST /boss/password/reset/:token: Restablece la contraseña del jefe.

POST /boss/login: Inicia sesión con las credenciales del jefe.

📁 Rutas del Negocio
Rutas Privadas

POST /negocios/create: Crea un nuevo negocio si el jefe tiene plan activo.

GET /negocios/list: Lista todos los negocios activos asociados al jefe.

GET /negocios/list/employees/:id: Lista los empleados de un negocio.

POST /negocios/add-employee: Agrega un empleado a un negocio.

GET /negocios/detail/:negocioId: Obtiene los detalles de un negocio.

PUT /negocios/update/:negocioId: Actualiza los detalles de un negocio.

DELETE /negocios/delete/:negocioId: Elimina un negocio.

DELETE /negocios/delete-employee/:id: Elimina un empleado de un negocio.

GET /negocios/report/employee/:id: Lista los reportes de un empleado en un negocio.

GET /negocios/report/:negocioId: Lista los reportes de un negocio.

POST /negocios/report/:empleadoId/:negocioId: Genera un reporte de productividad para un empleado en un negocio.

Instalación
1. Clonar el repositorio
bash
Copiar
git clone https://github.com/tu-usuario/tu-repo.git
2. Instalar dependencias
bash
Copiar
cd tu-repo
npm install
3. Configurar el archivo .env
Crea un archivo .env en la raíz del proyecto con las siguientes variables de entorno:

env
Copiar
MONGO_URI=tu_uri_de_mongo
STRIPE_PRIVATE_KEY=tu_stripe_private_key
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
WEB_SERVICE_TOKEN=tu_token_de_webservice
4. Iniciar el servidor
bash
Copiar
npm start
Tecnologías Utilizadas
Node.js: Backend de la API.

Express.js: Framework para construir la API.

MongoDB: Base de datos NoSQL para almacenar los datos.

Mongoose: ODM para interactuar con MongoDB.

Cloudinary: Para almacenar y gestionar imágenes (como fotos de perfil y logos).

Stripe: Para manejar pagos y suscripciones.

JWT: Para autenticación basada en tokens.

Fetch API: Para consultar la validez de una cédula a través de un servicio web externo.

Contribución
Si deseas contribuir a este proyecto, sigue estos pasos:

Haz un fork del repositorio.

Crea una nueva rama (git checkout -b mi-nueva-funcionalidad).

Realiza tus cambios y haz commit (git commit -am 'Añadir nueva funcionalidad').

Haz push a la rama (git push origin mi-nueva-funcionalidad).

Abre un Pull Request describiendo tus cambios.

