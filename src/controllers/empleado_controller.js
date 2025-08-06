import Employee from "../models/empleados.js";
import Negocio from "../models/negocios.js"
import {sendMailToNewEmployee, sendMailToRecoveryPasswordEmployee} from "../config/nodemailer.js";
import {createTokenJWT} from "../middlewares/JWT.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"

const registerEmployee = async (req, res) => {
    const {email,password,companyCode, cedula} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todos los campos"});
    const verificarEmailBDD = await Employee.findOne({email});
    if (verificarEmailBDD)
        return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"});
    const verificarCedulaBDD = await Employee.findOne({cedula});
        if (verificarCedulaBDD)
        return res.status(400).json({msg:"Lo sentimos, la cédula ya se encuentra registrada"});
    const verificarCodeBDD = await Negocio.findOne({companyCode});
    if (!verificarCodeBDD)
        return res.status(400).json({msg:"Lo sentimos, el codigo del negocio no existe"});
    const newEmployee = new Employee(req.body);
    newEmployee.password = await newEmployee.encrypPassword(password);
    newEmployee.companyName = verificarCodeBDD._id;
    const token =  await newEmployee.createToken();
    const rol = newEmployee.rol;
    await sendMailToNewEmployee(email, token, rol);
    await newEmployee.save();
    verificarCodeBDD.empleados.push(newEmployee._id);
    await verificarCodeBDD.save();
    res.status(200).json({msg: "Revisa tu correo electrónico para confirmar tu cuenta"});
}

const confirmEmail = async (req, res) => {
    const token = req.params.token;
    const tokenBDD = await Employee.findOne({token});
    if (!tokenBDD?.token)
        return res.status(404).json({msg:"La cuenta ya ha sido confirmada"});
    tokenBDD.token = null;
    tokenBDD.confirmEmail = true;
    await tokenBDD.save();
    res.status(200).json({msg:"Token confirmado con exito, ya puedes iniciar sesión"});
}

const recuperarPassword = async(req, res) => {
    const {email} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const employeeBDD = await Employee.findOne({email});
    if(!employeeBDD)
        return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"});
    const token = await employeeBDD.createToken();
    employeeBDD.token = token;
    const negocioCode = employeeBDD.companyCode;
    await sendMailToRecoveryPasswordEmployee(email, token, negocioCode);
    await employeeBDD.save();
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"});
}

const comprobarTokenPasword  = async (req, res) => {
    const token = req.params.token;
    const tokenBDD = await Employee.findOne({token});
    if(!tokenBDD) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"});
    await tokenBDD.save();
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"});
}

const createNewPassword = async (req, res) => {
    const {password, confirmpassword} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todos los campos"});
    if (password != confirmpassword)
        return res.status(400).json({msg:"Lo sentimos, los password no coinciden"});
    const employeeBDD = await Employee.findOne({token:req.params.token});
    if(employeeBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"});
    employeeBDD.token = null;
    employeeBDD.password = await employeeBDD.encrypPassword(password);
    await employeeBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"})
}

const loginEmployee = async(req,res)=>{
    const {email,password} = req.body;
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const employeeBDD = await Employee.findOne({email}).select("-status -__v -token -updatedAt -createdAt -isDeleted").populate('companyNames', '_id companyName companyCode');
    if(employeeBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"});
    if(!employeeBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"});
    const verificarPassword = await employeeBDD.matchPassword(password);
    if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos, el password no es el correcto"});
    const {nombres,apellidos,cedula,_id,rol, companyNames, companyCodes} = employeeBDD;
    const token = createTokenJWT(employeeBDD._id, employeeBDD.rol);
    res.status(200).json({
        token,
        nombres,
        apellidos,
        cedula,
        email:employeeBDD.email,
        companyNames,
        companyCodes,
        rol,
        _id,
    });
};

const perfilEmployee = async (req, res) => {
    const {
        password,
        token,
        confirmEmail,
        createdAt,
        updatedAt,
        __v,
        isDeleted,
        ...datosPerfil
    } = req.empleadoBDD.toObject();
    res.status(200).json(datosPerfil);
};

const updatePerfil = async (req, res) => {
    try {
        const { id } = req.empleadoBDD;
        const { nombres, apellidos, email } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ msg: "Lo sentimos, debe ser un id" });
        if (Object.values(req.body).includes(""))
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        const empleadoBDD = await Employee.findById(id);
        if (!empleadoBDD)
            return res.status(404).json({ msg: `Lo sentimos, no existe el empleado` });
        if (empleadoBDD.email !== email) {
            const empleadoBDDMail = await Employee.findOne({ email });
            if (empleadoBDDMail)
                return res.status(409).json({ msg: `Lo sentimos, el email ${email} ya se encuentra registrado` });
        }
        if(req.files?.foto){
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.foto.tempFilePath,{folder:'Administradores'});
            empleadoBDD.foto = secure_url;
            empleadoBDD.fotoID = public_id;
            await fs.unlink(req.files.foto.tempFilePath);
        }
        empleadoBDD.nombres = nombres ?? empleadoBDD.nombres;
        empleadoBDD.apellidos = apellidos ?? empleadoBDD.apellidos;
        empleadoBDD.email = email ?? empleadoBDD.email;
        await empleadoBDD.save();
        const empleadoActualizado = await Employee.findById(id).select("-password -createdAt -updatedAt -__v -isDeleted -token");
        res.status(200).json({
            msg: "Datos actualizados correctamente",
            data: empleadoActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const updatePassword = async (req, res) => {
    const { id } = req.empleadoBDD;
    const { password, confirmPassword} = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    if (Object.values(req.body).includes(""))
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    if (password !== confirmPassword)
        return res.status(400).json({ msg: "Lo sentimos, los passwords no coinciden" });
    const empleadoBDD = await Employee.findById(id);
    if (!empleadoBDD)
        return res.status(404).json({ msg: `Lo sentimos, no existe el empleado` });
    empleadoBDD.password = await empleadoBDD.encrypPassword(password);
    await empleadoBDD.save();
    res.status(200).json({ msg: "Password actualizado correctamente" });
};

export {
    registerEmployee,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPasword,
    createNewPassword,
    loginEmployee,
    perfilEmployee,
    updatePerfil,
    updatePassword
};
