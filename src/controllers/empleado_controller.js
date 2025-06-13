import Employee from "../models/empleados.js";
import Negocio from "../models/negocios.js"
import {sendMailToNewEmployee, sendMailToRecoveryPasswordEmployee} from "../config/nodemailer.js";

const registerEmployee = async (req, res) => {
    const {email,password, companyCode} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todos los campos"});
    const verificarEmailBDD = await Employee.findOne({email})
    if (verificarEmailBDD)
        return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"});
    const verificarCodeBDD = await Negocio.findOne({companyCode});
    if (!verificarCodeBDD)
        return res.status(400).json({msg:"Lo sentimos, el codigo del negocio no existe"});
    const newEmployee = new Employee(req.body);
    newEmployee.password = await newEmployee.encrypPassword(password);
    newEmployee.companyName = verificarCodeBDD._id;
    const token =  await newEmployee.createToken();
    await sendMailToNewEmployee(email, token);
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
        return res.status(404).json({msg:"Lo sentimos, el usuario mo se encuentra registrado"});
    const token = await employeeBDD.createToken();
    employeeBDD.token = token;
    const negocioCode = employeeBDD.adminCode;
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
    employeeBDD.token = null;
    employeeBDD.password = await employeeBDD.encrypPassword(password);
    await employeeBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"})
}


export {
    registerEmployee,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPasword,
    createNewPassword
};
