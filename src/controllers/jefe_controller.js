import Boss from "../models/jefes.js"
import { sendMailToNewBoss, sendMailToRecoveryPasswordBoss } from "../config/nodemailer.js"

const registerBoss = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) 
        return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const verificarEmailBDD = await Boss.findOne({email});
    if(verificarEmailBDD) 
        return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"});
    const nuevoBoss = new Boss(req.body);
    nuevoBoss.password = await nuevoBoss.encrypPassword(password);
    const token = await nuevoBoss.createToken();
    await sendMailToNewBoss(email,token);
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
    const bossBDD = await Boss.findOne({email}).select("-status -__v -token -updatedAt -createdAt");
    if(bossBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"});
    if(!bossBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"});
    const verificarPassword = await bossBDD.matchPassword(password);
    if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos, el password no es el correcto"});
    const {nombres,apellidos,cedula,_id,rol,plan, companyName, companyCode} = bossBDD;
    res.status(200).json({
        nombres,
        apellidos,
        cedula,
        email:bossBDD.email,
        companyName,
        companyCode,
        plan,
        rol,
        _id,
    });
};

import Boss from "../models/jefes.js";

const pagarPlan = async (req, res) => {
    try {
        const { email } = req.body;
        const jefe = await Boss.findOne({ email });
        if (!jefe) return res.status(404).json({ msg: "Jefe no encontrado" });
        jefe.plan = true;
        await jefe.save();
        res.status(200).json({ msg: "El plan activado exitosamente" });
    } catch (error) {
        res.status(500).json({ msg: "Error al activar el plan" });
    }
};

export {
    registerBoss,
    confirmEmail,
    recoverPassword,
    comprobarTokenPasword,
    createNewPassword,
    loginBoss,
    pagarPlan
};