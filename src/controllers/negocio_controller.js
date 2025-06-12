import Negocios from "../models/negocios.js";
import Boss from "../models/jefes.js";


const createNegocio = async (req, res) => {
    const {
        companyName,
        ruc,
        descripcion,
        categoria,
        direccion,
        telefono,
        emailContacto,
        emailBoss
    } = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todo los datos"});
    const jefeDBB = await Boss.findOne({email: emailBoss});
    if (!jefeDBB)
        return res.status(401).json({msg:"El usuario no se encuentra registrado"});
    const planDBB = jefeDBB.plan;
    if (!planDBB)
        return res.status(401).json({msg:"Lo sentimos, aquiere un plan para registrar tu negocio y puedas utilizar todos nuestros servicios"});
    const newNegocio = new Negocios(
        {
            companyName,
            ruc,
            descripcion,
            categoria,
            direccion,
            telefono,
            emailContacto,
            emailBoss: jefeDBB._id
        });
    newNegocio.companyCode = await newNegocio.createCode(companyName);
    await newNegocio.save();
    res.status(200).json({msg:"Tu negocio a sido registrado correctamente"})
}

export {
    createNegocio
}