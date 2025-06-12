import Negocios from "../models/negocios.js";
import Boss from "../models/jefes.js";
import { sendMailToRegisterNegocio } from "../config/nodemailer_negocios.js";

const createNegocio = async (req, res) => {
    const {emailBoss, companyName} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todo los datos"});
    const jefeDBB = await Boss.findOne({email: emailBoss});
    const planDBB = jefeDBB.plan;
    if (!planDBB)
        return res.status(401).json({msg:"Lo sentimos, aquiere un plan para registrar tu negocio y puedas utilizar todos nuestros servicios"});
    const newNegocio = new Negocios(
        {
            ...req.body,
            emailBoss: jefeDBB._id
        });
    newNegocio.companyCode = await newNegocio.createCode(companyName);
    jefeDBB.companyCode = newNegocio.companyCode;
    jefeDBB.companyName = newNegocio._id;
    await newNegocio.save();
    await jefeDBB.save();
    res.status(200).json({msg:"Tu negocio a sido registrado correctamente"})
}

const addEmployee = async (req, res) => {
    const { email, companyName, companyCode} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todo los datos"});
    await sendMailToRegisterNegocio(email, companyName, companyCode);
    res.status(200).json({msg:"Tu empleado fue añadido al negocio correctamente"});
}


export {
    createNegocio,
    addEmployee
}