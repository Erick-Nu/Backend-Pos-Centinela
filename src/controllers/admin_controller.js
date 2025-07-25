import Administrador from "../models/administradores.js"
import Boss from "../models/jefes.js"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { createTokenJWT } from "../middlewares/JWT.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"

const registroAdmin = async (req,res)=>{
    const {nombres,apellidos,email,cedula} = req.body
    if (Object.values(req.body).includes("")) 
        return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const verificarEmailBDD = await Administrador.findOne({email})
    if(verificarEmailBDD) 
        return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"});
    const verificarCedulaBDD = await Administrador.findOne({cedula})
    if(verificarCedulaBDD) 
        return res.status(400).json({msg:"Lo sentimos, la cédula ya se encuentra registrada"});
    const nuevoAdmin = new Administrador(req.body);
    const password = await nuevoAdmin.createTemporaryPassword(nombres, cedula);
    const token = await nuevoAdmin.crearToken();
    const adminCode = await nuevoAdmin.createCode(nombres, apellidos, cedula);
    nuevoAdmin.adminCode = adminCode;
    const rol = nuevoAdmin.rol;
    await sendMailToRegister(email, password, token, rol, adminCode);
    nuevoAdmin.password = await nuevoAdmin.encrypPassword(password);  
    await nuevoAdmin.save();
    res.status(200).json({msg:"Administrador registrado correctamente"});
}

const confirmarMail = async (req,res)=>{
    const token = req.params.token;
    const centinelaBDD = await Administrador.findOne({token});
    if(!centinelaBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"});
    centinelaBDD.token = null;
    centinelaBDD.confirmEmail=true;
    await centinelaBDD.save();
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"});
}

const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const administradorBDD = await Administrador.findOne({email});
    if(!administradorBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"});
    const token = administradorBDD.crearToken();
    administradorBDD.token = token;
    const adminCode = administradorBDD.adminCode;
    const rol = administradorBDD.rol;
    await sendMailToRecoveryPassword(email, token, adminCode, rol);
    await administradorBDD.save();
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"});
}

const comprobarTokenPasword = async (req,res)=>{
    const token = req.params.token
    const administradorBDD = await Administrador.findOne({token})
    if(administradorBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await administradorBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}

const crearNuevoPassword = async (req,res)=>{
    const{password,confirmPassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmPassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const administradorBDD = await Administrador.findOne({token:req.params.token})
    if(administradorBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    administradorBDD.token = null
    administradorBDD.password = await administradorBDD.encrypPassword(password)
    await administradorBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

const loginAdmin = async(req,res)=>{
    const {email, password, adminCode} = req.body;
    if (Object.values(req.body).includes("")) 
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    const administradorBDD = await Administrador.findOne({ email }).select("-__v -token -updatedAt -createdAt");
    if (!administradorBDD)
        return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
    if (administradorBDD.confirmEmail === false)
        return res.status(403).json({ msg: "Lo sentimos, debe verificar su cuenta" });
    const verificarPassword = await administradorBDD.matchPassword(password);
    if (!verificarPassword)
        return res.status(401).json({ msg: "Lo sentimos, el password no es el correcto" });
    const verificarCode = await Administrador.findOne({ adminCode });
    if (!verificarCode)
        return res.status(401).json({ msg: "Lo sentimos, tu código de administrador no es correcto" });
    const { nombres, apellidos, cedula, _id, rol } = administradorBDD;
    const token = createTokenJWT(administradorBDD._id, administradorBDD.rol);
    res.status(200).json({
        token,
        nombres,
        apellidos,
        cedula,
        adminCode: administradorBDD.adminCode,
        email: administradorBDD.email,
        rol,
        _id
    });
};

const perfilAdmin = async (req, res) => {
    const {
        password,
        token,
        confirmEmail,
        createdAt,
        updatedAt,
        __v,
        isDeleted,
        ...datosPerfil
    } = req.administradorBDD.toObject();
    res.status(200).json(datosPerfil);
};

const updatePerfil = async (req, res) => {
    try {
        const { id } = req.administradorBDD;
        const { nombres, apellidos, email } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ msg: "Lo sentimos, debe ser un id" });
        if (Object.values(req.body).includes(""))
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        const administradorBDD = await Administrador.findById(id);
        if (!administradorBDD)
            return res.status(404).json({ msg: `Lo sentimos, no existe el administrador` });
        if (administradorBDD.email !== email) {
            const administradorBDDMail = await Administrador.findOne({ email });
            if (administradorBDDMail)
                return res.status(409).json({ msg: `Lo sentimos, el email ${email} ya se encuentra registrado` });
        }
        if(req.files?.foto){
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.foto.tempFilePath,{folder:'Administradores'});
            administradorBDD.foto = secure_url;
            administradorBDD.fotoID = public_id;
            await fs.unlink(req.files.foto.tempFilePath);
        }
        administradorBDD.nombres = nombres ?? administradorBDD.nombres;
        administradorBDD.apellidos = apellidos ?? administradorBDD.apellidos;
        administradorBDD.email = email ?? administradorBDD.email;
        await administradorBDD.save();
        const administradorActualizado = await Administrador.findById(id).select("-password -createdAt -updatedAt -__v -isDeleted -token");
        res.status(200).json({
            msg: "Datos actualizados correctamente",
            data: administradorActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const updatePassword = async (req, res) => {
    const { id } = req.administradorBDD;
    const { password, confirmPassword, adminCode } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    if (Object.values(req.body).includes(""))
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    if (password !== confirmPassword)
        return res.status(400).json({ msg: "Lo sentimos, los passwords no coinciden" });
    if (adminCode !== req.administradorBDD.adminCode)
        return res.status(400).json({ msg: "Lo sentimos, el código de administrador no es correcto" });
    const administradorBDD = await Administrador.findById(id);
    if (!administradorBDD)
        return res.status(404).json({ msg: `Lo sentimos, no existe el administrador` });
    administradorBDD.password = await administradorBDD.encrypPassword(password);
    await administradorBDD.save();
    res.status(200).json({ msg: "Password actualizado correctamente" });
};


const listAdmins = async (req, res) => {
    const administradores = await Administrador.find({isDeleted: false}).select("-password -createdAt -updatedAt -__v -token -isDeleted");
    res.status(200).json(administradores);
};

const detalleAdmin = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ msg: "Lo sentimos, debe ser un id válido" });
    const administradorBDD = await Administrador.findById(id).select("-password -createdAt -updatedAt -__v -token -isDeleted");
    if (!administradorBDD)
        return res.status(404).json({ msg: "Lo sentimos, no existe el administrador" });
    res.status(200).json(administradorBDD);
}

const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ msg: "Lo sentimos, debe ser un id válido" });
    const administradorBDD = await Administrador.findById(id);
    if (!administradorBDD)
        return res.status(404).json({ msg: "Lo sentimos, no existe el administrador" });
    administradorBDD.isDeleted = true;
    await administradorBDD.save();
    res.status(200).json({ msg: "Administrador eliminado correctamente" });
};

const listBoss = async (req, res) => {
    const bosses = await Boss.find({isDeleted: false}).select("-password -createdAt -updatedAt -__v -token -isDeleted");
    res.status(200).json(bosses);
};

// Falta de actualizar las propiedades de los jefes
const deleteBoss = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ msg: "Lo sentimos, debe ser un id válido" });
    const bossBDD = await Boss.findById(id);
    if (!bossBDD)
        return res.status(404).json({ msg: "Lo sentimos, no existe el jefe" });
    bossBDD.isDeleted = true;
    await bossBDD.save();
    res.status(200).json({ msg: "Jefe eliminado correctamente" });
};

export {
    registroAdmin,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    loginAdmin,
    perfilAdmin,
    updatePerfil,
    updatePassword,
    listAdmins,
    detalleAdmin,
    deleteAdmin,
    listBoss,
    deleteBoss
}
