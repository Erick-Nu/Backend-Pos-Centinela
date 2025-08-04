import Negocios from "../models/negocios.js";
import Boss from "../models/jefes.js";
import { sendMailToRegisterNegocio } from "../config/nodemailer_negocios.js"


const createNegocio = async (req, res) => {
    const {id} = req.jefeBDD;
    const { companyName, ruc } = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({ msg: "Lo sentimos, debes de llenar todos los datos" });
    const jefeDBB = await Boss.findById(id);
    if (!jefeDBB) return res.status(404).json({ msg: "Jefe no encontrado" });
    const planDBB = jefeDBB?.plan;
    const numNegocios = jefeDBB?.companyNames?.length || 0;
    const planLimits = {
        starter: 1,
        business: 5,
        enterprise: Infinity
    };
    const maxNegocios = planLimits[planDBB];
    if (maxNegocios !== undefined && numNegocios >= maxNegocios) {
    let mensaje = '';
    switch (planDBB) {
        case 'starter':
        mensaje = "Tu plan 'starter' solo permite registrar 1 negocio. Para agregar más, mejora tu suscripción.";
        break;
        case 'business':
        mensaje = "Tu plan 'business' permite registrar hasta 5 negocios. Para continuar, mejora tu plan.";
        break;
        case 'enterprise':
        mensaje = "Tu plan 'enterprise' permite negocios ilimitados. No deberías estar viendo este mensaje.";
        break;
        default:
        mensaje = "Plan no válido. Comunícate con soporte.";
    }
    return res.status(401).json({ msg: mensaje });
    }
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
    jefeDBB.companyCodes.push(finalCode);
    jefeDBB.companyNames.push(newNegocio._id);
    await newNegocio.save();
    await jefeDBB.save();
    res.status(200).json({ msg: "Tu negocio ha sido registrado correctamente" });
};


const addEmployee = async (req, res) => {
    const {emailEmpleado, emailJefe} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todo los datos"});
    const jefeDBB = await Boss.findOne({email: emailJefe});
    if (!jefeDBB)
        return res.status(404).json({msg:"Lo sentimos, el jefe no se encuentra registrado"});
    const negocioDBB = await Negocios.findOne({emailBoss: jefeDBB._id});
    if (!negocioDBB)
        return res.status(404).json({msg:"Lo sentimos, el negocio no se encuentra registrado"});
    await sendMailToRegisterNegocio(emailEmpleado, negocioDBB.companyName, negocioDBB.companyCode, "Empleado");
    res.status(200).json({msg:"Tu empleado fue añadido al negocio correctamente"});
};


export {
    createNegocio,
    addEmployee
}