import Boss from "../models/jefes.js"
import { sendMailToNewBoss, sendMailToRecoveryPasswordBoss,sendMailNewPasswordBoss} from "../config/nodemailer.js"
import { createTokenJWT } from "../middlewares/JWT.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs-extra";
import { Stripe } from "stripe"


const consultaCedula = async (req, res) => {
    const { cedula } = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    const cedulaExistente = await Boss.findOne({ cedula });
    if (cedulaExistente) {
        return res.status(400).json({ msg: "Lo sentimos, la cédula ya se encuentra registrada" });
    }
    try {
        const response = await fetch(`https://webservices.ec/api/cedula/${cedula}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.WEB_SERVICE_TOKEN}`,
                'Content-Type': 'application/json'
            },
        });
        const usuario = await response.json(); 
        res.status(200).json({
            msg: "La cédula es válida",
            data: {
                nombres: usuario.data.response.nombres,
                apellidos: usuario.data.response.apellidos,
                cedula: usuario.data.response.identificacion,
            }
        });
    } catch (error) {
        res.status(500).json({
            msg: 'La cédula no es válida'
        });
    }
};


const registerBoss = async (req,res)=>{
    const {email,password,cedula,nombres,apellidos} = req.body
    if (Object.values(req.body).includes("")) 
        return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const verificarEmailBDD = await Boss.findOne({email});
    if(verificarEmailBDD) 
        return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"});
    const verificarCedulaBDD = await Boss.findOne({cedula});
    if (verificarCedulaBDD)
        return res.status(400).json({msg:"Lo sentimos, la cédula ya se encuentra registrada"});
    const nuevoBoss = new Boss(req.body);
    nuevoBoss.password = await nuevoBoss.encrypPassword(password);
    const token = await nuevoBoss.createToken();
    const rol = nuevoBoss.rol;
    const primerNombre = nombres.split(" ")[0];
    const primerApellido = apellidos.split(" ")[0];
    const nombreCompleto = `${primerNombre} ${primerApellido}`;
    await sendMailToNewBoss(email,token,rol,nombreCompleto);
    await nuevoBoss.save();
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"});
}

const confirmEmail = async (req,res)=>{
    const token = req.params.token;
    const centinelaBDD = await Boss.findOne({token});
    if(!centinelaBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"});
    centinelaBDD.token = null;
    centinelaBDD.confirmEmail=true;
    await centinelaBDD.save();
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"});
}

const recoverPassword = async(req,res)=>{
    const {email} = req.body;
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const bossBDD = await Boss.findOne({email});
    if(!bossBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"});
    const token = await bossBDD.createToken();
    bossBDD.token=token;
    await sendMailToRecoveryPasswordBoss(email,token);
    await bossBDD.save();
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"});
}

const comprobarTokenPasword = async (req,res)=>{
    const token = req.params.token;
    const bossBDD = await Boss.findOne({token});
    if(bossBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"});
    await bossBDD.save();
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"});
}

const createNewPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body;
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"});
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"});
    const bossBDD = await Boss.findOne({token:req.params.token});
    if(bossBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"});
    bossBDD.token = null;
    bossBDD.password = await bossBDD.encrypPassword(password);
    await bossBDD.save();
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"});
};

const loginBoss = async(req,res)=>{
    const {email,password} = req.body;
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const bossBDD = await Boss.findOne({email}).select("-__v -token -updatedAt -createdAt -fotoID -isDeleted").populate('companyNames', '_id companyName companyCode');
    if(!bossBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"});
    if(bossBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"});
    const verificarPassword = await bossBDD.matchPassword(password);
    if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos, credenciales incorrectas"});
    const {nombres,apellidos,cedula,_id,rol,plan,companyNames,companyCodes,foto, fotoID, status, isDeleted} = bossBDD;
    const token = createTokenJWT(bossBDD._id, bossBDD.rol);
    res.status(200).json({
        token,
        _id,
        nombres,
        apellidos,
        cedula,
        email:bossBDD.email,
        foto,
        fotoID,
        status,
        companyNames,
        companyCodes,
        plan,
        rol,
        isDeleted
    });
};

const perfilBoss = async (req, res) => {
    const jefe = await Boss.findById(req.jefeBDD._id)
        .select("-password -token -confirmEmail -__v -isDeleted -createdAt -updatedAt -fotoID")
        .populate("companyNames", "_id companyName companyCode");
    if (!jefe) {
        return res.status(404).json({ msg: "Jefe no encontrado" });
    }
    res.status(200).json(jefe);
};

const updatePerfil = async (req, res) => {
    try {
        const { id } = req.jefeBDD;
        const { nombres, apellidos, email } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ msg: "Lo sentimos, debe ser un id" });
        if (Object.values(req.body).includes(""))
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        const jefeBDD = await Boss.findById(id);
        if (!jefeBDD)
            return res.status(404).json({ msg: `Lo sentimos, no existe el jefe` });
        if (jefeBDD.email !== email) {
            const jefeBDDMail = await Boss.findOne({ email });
            if (jefeBDDMail)
                return res.status(409).json({ msg: `Lo sentimos, el email ${email} ya se encuentra registrado` });
        }
        if(req.files?.foto){
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.foto.tempFilePath,{folder:'Jefes'});
            jefeBDD.foto = secure_url;
            jefeBDD.fotoID = public_id;
            await fs.unlink(req.files.foto.tempFilePath);
        }
        jefeBDD.nombres = nombres ?? jefeBDD.nombres;
        jefeBDD.apellidos = apellidos ?? jefeBDD.apellidos;
        jefeBDD.email = email ?? jefeBDD.email;
        await jefeBDD.save();
        const jefeActualizado = await Boss.findById(id).select("-password -createdAt -updatedAt -__v -isDeleted -token").populate("companyNames", "_id companyName companyCode");
        res.status(200).json({
            msg: "Datos actualizados correctamente",
            data: jefeActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const updatePassword = async (req, res) => {
    const { id } = req.jefeBDD;
    const { password, confirmPassword } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    if (Object.values(req.body).includes(""))
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    if (password !== confirmPassword)
        return res.status(400).json({ msg: "Lo sentimos, los passwords no coinciden" });
    const jefeBDD = await Boss.findById(id);
    if (!jefeBDD)
        return res.status(404).json({ msg: `Lo sentimos, no existe el jefe` });
    jefeBDD.password = await jefeBDD.encrypPassword(password);
    await jefeBDD.save();
    const { email } = jefeBDD;
    await sendMailNewPasswordBoss(email);
    res.status(200).json({ msg: "Password actualizado correctamente" });
};

// Metodo para el pago del plan
// Lista de suscripciones
const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`);

const listPlans = async (req, res) => {
    try {
        const prices = await stripe.prices.list();
        return res.status(200).json({ prices });
    } catch (error) {
        console.error(error);  
        return res.status(500).json({ msg: "Error al listar las suscripciones", error: error.message });
    }
};

const pagoPlan = async (req, res) => {
    const { id } = req.jefeBDD;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    try {
        const { planId } = req.body;
        if (!planId) return res.status(400).json({ msg: "Plan ID es requerido" });
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: planId,
                    quantity: 1
                }
            ],
            success_url: `${process.env.URL_FRONTEND}/dashboard/upgrade-plan/result`,
            cancel_url: `${process.env.URL_FRONTEND}/dashboard/upgrade-plan/result`
        });
        return res.status(200).json({ url: session.url });
    } catch (error) {
        console.error(error);  
        return res.status(500).json({ msg: "Error al intentar pagar", error: error.message });
    }
};

const verificarPago = (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk;  // Concatenamos los fragmentos del cuerpo
    });

    req.on('end', () => {
        const sig = req.headers["stripe-signature"];
        const webhookSecret = "whsec_4IS6ac472dNrK1xbE7v9SHD4F04rZ9iW";
        let event;

        try {
            // Verificamos la firma del webhook con el cuerpo recibido
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
            return res.status(200).json({ json: { event }, msg: "Verificación de pago exitosa" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al verificar el pago", error: error.message });
        }
    });
};

export {
    consultaCedula,
    registerBoss,
    confirmEmail,
    recoverPassword,
    comprobarTokenPasword,
    createNewPassword,
    loginBoss,
    perfilBoss,
    updatePerfil,
    updatePassword,
    listPlans,
    pagoPlan,
    verificarPago
};