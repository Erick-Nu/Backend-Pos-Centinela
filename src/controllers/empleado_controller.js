import Employee from "../models/empleados.js";
import Negocio from "../models/negocios.js"
import {sendMailToNewEmployee, sendMailToRecoveryPasswordEmployee} from "../config/nodemailer.js";

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
    const rol = employeeBDD.rol;
    await sendMailToRecoveryPasswordEmployee(email, token, negocioCode, rol);
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

const loginEmployee = async(req,res)=>{
    const {email,password,companyCode} = req.body;
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const employeeBDD = await Employee.findOne({email}).select("-status -__v -token -updatedAt -createdAt");
    if(employeeBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"});
    if(!employeeBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"});
    const verificarPassword = await employeeBDD.matchPassword(password);
    if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos, el password no es el correcto"});
    const verificarCode = await Employee.findOne({companyCode: companyCode});
    if(!verificarCode) return res.status(401).json({msg:"Lo sentimos, el código del negocio no es correcto"});
    const {nombres,apellidos,cedula,_id,rol, companyName} = employeeBDD;
    res.status(200).json({
        nombres,
        apellidos,
        cedula,
        email:employeeBDD.email,
        companyName,
        companyCode:employeeBDD.companyCode,
        rol,
        _id,
    });
};

export {
    registerEmployee,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPasword,
    createNewPassword,
    loginEmployee
};
