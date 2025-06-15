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

const sendMailToRegister = (userMail, token, adminCode) => {
    let mailOptions = {
        from: 'admin@centinela.ec',
        to: userMail,
        subject: "POS CENTINELA EC - Confirmación de Registro",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

            <div style="background-color: #1abc9c; padding: 24px 16px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">
                    POS CENTINELA
                </h1>
                <p style="margin: 6px 0 0; color: #e0f7f4; font-size: 14px; font-style: italic;">
                    Monitorea. Aprende. Mejora.
                </p>
            </div>

            <div style="text-align: center; padding: 20px;">
                <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG9ubGx1cTIweTd0ZTNuMnlxaDVka2I5Nnd4eXhueGhodTRseHpuciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TiRaHUdJnNA38z0H7G/giphy.gif" 
                    alt="Administrador animado" 
                    style="width: 180px; height: auto; border-radius: 8px;" />
            </div>

            <div style="padding: 0 30px 30px 30px;">
                <h2 style="color: #1a202c; text-align: center; font-size: 22px;">¡Bienvenido a <span style="color:#1abc9c;">POS CENTINELA</span>!</h2>

                <p style="font-size: 16px; color: #4a5568; text-align: justify;">
                    ¡Nos alegra mucho darte la bienvenida como nuevo <strong>Administrador</strong> en <strong>POS CENTINELA</strong>! Estamos encantados de contar contigo en este gran proyecto de monitoreo inteligente impulsado por Inteligencia Artificial.
                </p>

                <p style="font-size: 16px; color: #4a5568;">
                    Para completar tu registro y activar tu cuenta, solo falta un paso:
                </p>

                <div style="text-align: center; margin-top: 20px;">
                    <p style="font-size: 16px; color: #4a5568;">
                        Tu código de administrador es:
                    </p>
                    <div style="font-size: 24px; font-weight: bold; color: #16a085; letter-spacing: 2px; background-color: #f0fdfa; display: inline-block; padding: 10px 20px; border-radius: 10px;">
                        ${adminCode}
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.URL_FRONTEND}"  
                        style="background-color: #1abc9c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Confirmar mi cuenta
                    </a>
                </div>

                <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 20px;">
                    Si no solicitaste unirte a POS CENTINELA, puedes ignorar este mensaje.
                </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; background-color: #f9f9f9; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px;">
                🤖 El equipo de <strong>POS CENTINELA</strong> está feliz de tenerte con nosotros.<br>
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

const sendMailToRecoveryPassword = async(userMail, token, adminCode) => {
    let info = await transporter.sendMail({
        from: 'admin@centinela.ec',
        to: userMail,
        subject: "POS CENTINELA EC - Recupera tu contraseña",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

            <div style="background-color: #1abc9c; padding: 24px 16px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">
                    POS CENTINELA
                </h1>
                <p style="margin: 6px 0 0; color: #e0f7f4; font-size: 14px; font-style: italic;">
                    Monitorea. Aprende. Mejora.
                </p>
            </div>

            <div style="text-align: center; padding: 20px;">
                <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDBlcm00Z3I2amtrdDk4dm54YzFxc3o1OGg0d200MWdzdTE2MTVrNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4Tkdz39XtGaLACQAVA/giphy.gif" 
                    alt="Administrador animado" 
                    style="width: 180px; height: auto; border-radius: 8px;" />
            </div>

            <div style="padding: 0 30px 30px 30px;">
                <h2 style="color: #1a202c; text-align: center; font-size: 22px;">Restablecimiento de contraseña</h2>

                <p style="font-size: 16px; color: #4a5568;">Hola, administrador:</p>

                <p style="font-size: 16px; color: #4a5568; text-align: justify;">
                    Hemos recibido una solicitud para restablecer tu contraseña en <strong>POS CENTINELA</strong>. No te preocupes, esto también les sucede a los mejores 😉.
                </p>

                <p style="font-size: 16px; color: #4a5568;">
                    Para continuar con el proceso, simplemente haz clic en el siguiente botón:
                </p>

                <div style="text-align: center; margin-top: 20px;">
                    <p style="font-size: 16px; color: #4a5568;">
                        Tu código de administrador es:
                    </p>
                    <div style="font-size: 24px; font-weight: bold; color: #16a085; letter-spacing: 2px; background-color: #f0fdfa; display: inline-block; padding: 10px 20px; border-radius: 10px;">
                        ${adminCode}
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.URL_FRONTEND}"  
                        style="background-color: #1abc9c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Restablecer contraseña
                    </a>
                </div>

                <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 30px;">
                    Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
                </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; background-color: #f9f9f9; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px;">
                🤖 El equipo de <strong>POS CENTINELA</strong> está aquí para ayudarte.<br>
                <em>Monitorea. Aprende. Mejora.</em>
            </div>
        </div>
        `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}


// Verificacion de un nuevo Empleado correo personalizado

const sendMailToNewEmployee = (userMail, token, rol) => {
    let mailOptions = {
        from: 'admin@centinela.ec',
        to: userMail,
        subject: "POS CENTINELA EC - ¡Bienvenido a nuestro equipo! ",
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

            <div style="background-color: #1abc9c; padding: 24px 16px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">
                    POS CENTINELA
                </h1>
                <p style="margin: 6px 0 0; color: #e0f7f4; font-size: 14px; font-style: italic;">
                    Monitorea. Aprende. Mejora.
                </p>
            </div>

            <div style="text-align: center; padding: 20px;">
                <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG9xMXhycGowdGFkbXlkdjI4Z2Z5MXYxNHVmc2c2ODh5cnk4bXNxNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7E8tiGcPf1G78dMXRf/giphy.gif" 
                    alt="Cámara de seguridad animada" 
                    style="width: 180px; height: auto; border-radius: 8px;" />
            </div>

            <div style="padding: 0 30px 30px 30px;">
                <h2 style="color: #1a202c; text-align: center; font-size: 22px;">¡Felicidades! </h2>

                <p style="font-size: 16px; color: #4a5568;">Hola,</p>

                <p style="font-size: 16px; color: #4a5568; text-align: justify;">
                    Has sido añadido exitosamente al equipo. ¡Estamos muy contentos de tenerte a bordo!
                </p>

                <p style="font-size: 16px; color: #4a5568;">
                    Para activar tu cuenta y comenzar a trabajar con nosotros, haz clic en el botón a continuación:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.URL_FRONTEND}/confirm/${rol}/${token}"  
                        style="background-color: #1abc9c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Confirmar mi cuenta
                    </a>
                </div>

                <p style="font-size: 14px; color: #718096; text-align: center;">Si no solicitaste este correo, puedes ignorarlo.</p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; background-color: #f9f9f9; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px;">
                🤖 El equipo de <strong>POS CENTINELA</strong> te acompaña en esta nueva etapa.<br>
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

const sendMailToRecoveryPasswordEmployee = async (userMail, token, companyCode, rol) => {
    let info = await transporter.sendMail({
        from: 'admin@centinela.ec',
        to: userMail,
        subject: "POS CENTINELA EC - ¡Recupera tu contraseña y no la pierdas otra vez!",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

            <div style="background-color: #1abc9c; padding: 24px 16px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">
                    POS CENTINELA
                </h1>
                <p style="margin: 6px 0 0; color: #e0f7f4; font-size: 14px; font-style: italic;">
                    Monitorea. Aprende. Mejora.
                </p>
            </div>

            <div style="text-align: center; padding: 20px;">
                <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHRkMHRyd2xraWVvNTB1amZzN3hqZTFvamI4eWY5Z29jNWh6dHpmOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/woWQA2I7xqRMI/giphy.gif" 
                    alt="Cámara de seguridad animada" 
                    style="width: 180px; height: auto; border-radius: 8px;" />
            </div>

            <div style="padding: 0 30px 30px 30px;">
                <h2 style="color: #1a202c; text-align: center; font-size: 22px;">🔐 ¡Ups! ¿Olvidaste tu contraseña?</h2>

                <p style="font-size: 16px; color: #4a5568; text-align: justify;">
                    No te preocupes, en <strong>POS CENTINELA</strong> te cubrimos las espaldas. Sabemos que a veces pueden ocurrir olvidos o situaciones inesperadas, por eso hemos creado un proceso rápido y seguro para que recuperes el acceso a tu cuenta sin complicaciones. 
                </p>
                <div style="text-align: center; margin-top: 20px;">
                    <p style="font-size: 16px; color: #4a5568;">
                        Codigo del negocio:
                    </p>
                    <div style="font-size: 24px; font-weight: bold; color: #16a085; letter-spacing: 2px; background-color: #f0fdfa; display: inline-block; padding: 10px 20px; border-radius: 10px;">
                        ${companyCode}
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.URL_FRONTEND}/confirm/${rol}/${token}"  
                        style="background-color: #1abc9c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Restablecer contraseña
                    </a>
                </div>

                <p style="font-size: 14px; color: #718096; text-align: center;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; background-color: #f9f9f9; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px;">
                🤖 El equipo de <strong>POS CENTINELA</strong> te da la bienvenida.<br>
                <em>Monitorea. Aprende. Mejora.</em>
            </div>
        </div>
        `
    });

    console.log("Correo de recuperación enviado ✅:", info.messageId);
};

// Verificacion de un nuevo Jefe correo personalizado

const sendMailToNewBoss = (userMail, token, rol) => {
    let mailOptions = {
        from: 'admin@centinela.ec',
        to: userMail,
        subject: "POS CENTINELA EC - ¡Bienvenido a nuestra plataforma! ",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

            <div style="background-color: #1abc9c; padding: 24px 16px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">
                    POS CENTINELA
                </h1>
                <p style="margin: 6px 0 0; color: #e0f7f4; font-size: 14px; font-style: italic;">
                    Monitorea. Aprende. Mejora.
                </p>
            </div>

            <div style="text-align: center; padding: 20px;">
                <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3c4dzNkaXpzYnhqbmpyN2F0bXBpenF4ZXB1Mmc3Zno3bW5jMm54YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UShetzBnSmKNE3tc4L/giphy.gif" 
                    alt="Cámara de seguridad animada" 
                    style="width: 180px; height: auto; border-radius: 8px;" />
            </div>

            <div style="padding: 0 30px 30px 30px;">
                <h2 style="color: #1a202c; text-align: center; font-size: 22px;">Bienvenido a <span style="color:#1abc9c;">POS CENTINELA</span></h2>

                <p style="font-size: 16px; color: #4a5568;">Hola,</p>

                <p style="font-size: 16px; color: #4a5568; text-align: justify;">
                    Gracias por unirte al equipo de POS CENTINELA, la plataforma que utiliza Inteligencia Artificial para mejorar la productividad.
                </p>

                <p style="font-size: 16px; color: #4a5568;">
                    Para activar tu cuenta y comenzar a utilizar nuestro sistemas, haz clic en el siguiente botón:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.URL_FRONTEND}/confirm/${rol}/${token}"  
                        style="background-color: #1abc9c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Confirmar mi cuenta
                    </a>
                </div>

                <p style="font-size: 14px; color: #718096; text-align: center;">Si no solicitaste este correo, puedes ignorarlo.</p>
            </div>

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

const sendMailToRecoveryPasswordBoss = async (userMail, token, rol) => {
    let info = await transporter.sendMail({
        from: 'admin@centinela.ec',
        to: userMail,
        subject: "POS CENTINELA EC - ¡Recupera tu contraseña y no la pierdas otra vez!",
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 0; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

            <div style="background-color: #1abc9c; padding: 24px 16px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">
                    POS CENTINELA
                </h1>
                <p style="margin: 6px 0 0; color: #e0f7f4; font-size: 14px; font-style: italic;">
                    Monitorea. Aprende. Mejora.
                </p>
            </div>

            <div style="text-align: center; padding: 20px;">
                <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWp4aDVraHF1Nzd6ZzRlMmkxeHdtdGt2M2preGl4Z3Z1a2ZlNDAzayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aTskHEUdgCQAXde/giphy.gif" 
                    alt="Cámara de seguridad animada" 
                    style="width: 300px; height: auto; border-radius: 8px;" />
            </div>

            <div style="padding: 0 30px 30px 30px;">
                <h2 style="color: #1a202c; text-align: center; font-size: 22px;">🔐 ¡Ups! ¿Olvidaste tu contraseña?</h2>

                <p style="font-size: 16px; color: #4a5568; text-align: justify;">
                    No te preocupes, en <strong>POS CENTINELA</strong> te cubrimos las espaldas. Sabemos que a veces pueden ocurrir olvidos o situaciones inesperadas, por eso hemos creado un proceso rápido y seguro para que recuperes el acceso a tu cuenta sin complicaciones. 
                </p>

                <p style="font-size: 16px; color: #4a5568;">
                    Para restablecer tu contraseña, haz clic en el siguiente botón:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.URL_FRONTEND}/confirm/${rol}/${token}"  
                        style="background-color: #1abc9c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Restablecer contraseña
                    </a>
                </div>

                <p style="font-size: 14px; color: #718096; text-align: center;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; background-color: #f9f9f9; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px;">
                🤖 El equipo de <strong>POS CENTINELA</strong> te da la bienvenida.<br>
                <em>Monitorea. Aprende. Mejora.</em>
            </div>
        </div>
        `
    });

    console.log("Correo de recuperación enviado ✅:", info.messageId);
};




export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
    sendMailToNewEmployee,
    sendMailToRecoveryPasswordEmployee,
    sendMailToNewBoss,
    sendMailToRecoveryPasswordBoss
};
