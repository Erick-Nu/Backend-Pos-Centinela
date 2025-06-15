import Negocios from "../models/negocios.js";
import Boss from "../models/jefes.js";
import { sendMailToRegisterNegocio } from "../config/nodemailer_negocios.js";

const createNegocio = async (req, res) => {
    const { emailBoss, companyName, ruc } = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({ msg: "Lo sentimos, debes de llenar todos los datos" });
    const jefeDBB = await Boss.findOne({ email: emailBoss });
    const negocioNum = jefeDBB?.companyName;
    if (negocioNum)
        return res.status(400).json({ msg: "Lo sentimos, ya tienes registrado un negocio" });
    const planDBB = jefeDBB?.plan;
    if (!planDBB)
        return res.status(401).json({ msg: "Lo sentimos, adquiere un plan para registrar tu negocio y puedas utilizar todos nuestros servicios" });
    const newNegocio = new Negocios({
        ...req.body,
        emailBoss: jefeDBB._id
    });
    const verifyRuc = await newNegocio.verifyRuc(ruc);
    if (!verifyRuc)
        return res.status(400).json({ msg: "Lo sentimos, el RUC debe tener exactamente 13 dígitos numéricos" });
    let baseCode = await newNegocio.createCode(companyName);
    let finalCode = baseCode;
    let contador = 1;
    while (await Negocios.findOne({ companyCode: finalCode })) {
        finalCode = `${baseCode}${contador}`;
        contador++;
    }
    newNegocio.companyCode = finalCode;
    jefeDBB.companyCode = finalCode;
    jefeDBB.companyName = newNegocio._id;
    await newNegocio.save();
    await jefeDBB.save();
    res.status(200).json({ msg: "Tu negocio ha sido registrado correctamente" });
};


const addEmployee = async (req, res) => {
    const {email, companyName, companyCode} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todo los datos"});
    await sendMailToRegisterNegocio(email, companyName, companyCode, rol="Empleado");
    res.status(200).json({msg:"Tu empleado fue añadido al negocio correctamente"});
};


export {
    createNegocio,
    addEmployee
}