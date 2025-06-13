import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const sendMailToRegisterNegocio = (userMail, companyName, companyCode) => {
    let mailOptions = {
        from: 'admin@centinela.ec',
        to: userMail,
        subject: "POS CENTINELA EC - Confirmación de Registro Empleado",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

            <!-- Encabezado con nombre de empresa -->
            <div style="background-color: #1abc9c; padding: 24px 16px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">
                    POS CENTINELA
                </h1>
                <p style="margin: 6px 0 0; color: #e0f7f4; font-size: 14px; font-style: italic;">
                    Monitorea. Aprende. Mejora.
                </p>
            </div>

            <!-- Imagen animada -->
            <div style="text-align: center; padding: 20px;">
                <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2c3NDZ4MGcwMXQ5dDc3bTlreTFwcWV1MzFlbzg4ZnJ0YTg5cXF2ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wzJ67MJMk6UMM/giphy.gif" 
                    alt="Cámara de seguridad animada" 
                    style="width: 180px; height: auto; border-radius: 8px;" />
            </div>

            <!-- Contenido principal -->
            <div style="padding: 0 30px 30px 30px;">
                <h2 style="color: #1a202c; text-align: center; font-size: 22px;">Bienvenido a <span style="color:#1abc9c;">POS CENTINELA</span></h2>

                <p style="font-size: 16px; color: #4a5568;">Hola,</p>

                <p style="font-size: 16px; color: #4a5568; text-align: justify;">
                    Has sido registrado como empleado en <strong>${companyName}</strong>. Para comenzar, debes completar tu registro configurando tu contraseña.
                </p>

                <div style="text-align: center; margin-top: 20px;">
                    <p style="font-size: 16px; color: #4a5568;">
                        El codigo del negocio es:
                    </p>
                    <div style="font-size: 24px; font-weight: bold; color: #16a085; letter-spacing: 2px; background-color: #f0fdfa; display: inline-block; padding: 10px 20px; border-radius: 10px;">
                        ${companyCode}
                    </div>
                </div>

                <p style="font-size: 16px; color: #4a5568;">
                    Para activar tu cuenta, por favor haz clic en el siguiente botón:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.URL_BACKEND}employees/register"  
                        style="background-color: #1abc9c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Confirmar mi cuenta
                    </a>
                </div>

                <p style="font-size: 14px; color: #718096; text-align: center;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e2e8f0; background-color: #f9f9f9; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px;">
                🤖 El equipo de <strong>POS CENTINELA</strong> te da la bienvenida.<br>
                <em>Monitorea. Aprende. Mejora.</em>
            </div>
        </div>
        `
    }   

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
        }
    })
}

export {
    sendMailToRegisterNegocio
};