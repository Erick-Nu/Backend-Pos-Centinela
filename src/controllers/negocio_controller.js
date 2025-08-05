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

const listNegocios = async (req, res) => {
    try {
        // Desestructurar el ID del jefe desde la base de datos
        const { id } = req.jefeBDD;

        // Buscar al jefe en la base de datos y obtener los nombres de las empresas
        const jefeBDD = await Boss.findById(id)
            .select("companyNames")  // Seleccionamos solo el campo companyNames
            .populate("companyNames", "_id");  // Poblamos la referencia de companyNames con su id

        // Verificar si no existe el jefe o no tiene empresas asociadas
        if (!jefeBDD || !jefeBDD.companyNames.length) {
            return res.status(404).json({ msg: "No se encontraron negocios" });
        }

        // Obtener todos los IDs de las empresas asociadas
        const companyIds = jefeBDD.companyNames.map(company => company._id);

        // Buscar cada negocio (empresa) por su ID y verificar si está eliminado
        const negocios = await Promise.all(
            companyIds.map(async (companyId) => {
                const company = await Negocios.findById(companyId); // Reemplazar 'Company' con el modelo adecuado

                // Verificar si la empresa está eliminada
                if (company && !company.isDeleted) {
                    return { _id: company._id, name: company.name }; // Ajusta los campos a devolver según lo que necesites
                }
                return null;  // Si la empresa está eliminada, no la incluimos
            })
        );

        // Filtrar las empresas que no están eliminadas
        const validNegocios = negocios.filter(negocio => negocio !== null);

        // Verificar si no se encontraron negocios válidos
        if (!validNegocios.length) {
            return res.status(404).json({ msg: "No se encontraron negocios activos" });
        }

        // Enviar la respuesta con los negocios válidos
        return res.status(200).json({ companyNames: validNegocios });

    } catch (error) {
        // Manejo de errores: si algo sale mal, registrar el error y enviar un mensaje genérico
        console.error('Error al obtener negocios:', error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};





const addEmployee = async (req, res) => {
    const {id} = req.jefeBDD;
    const {emailEmpleado} = req.body;
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todo los datos"});
    const jefeDBB = await Boss.findById(id);
    if (!jefeDBB)
        return res.status(404).json({msg:"Lo sentimos, el jefe no se encuentra registrado"});
    const negocioDBB = await Negocios.findOne({emailBoss: jefeDBB._id});
    if (!negocioDBB)
        return res.status(404).json({msg:"Lo sentimos, el negocio no se encuentra registrado"});
    await sendMailToRegisterNegocio(emailEmpleado, negocioDBB.companyName, negocioDBB.companyCode, "Empleado");
    res.status(200).json({msg:"Tu empleado fue añadido al negocio correctamente"});
};

const deleteNegocio = async (req, res) => {
    try {
        const { id } = req.jefeBDD; 
        const { negocioId } = req.body; 
        if (!negocioId) {
            return res.status(400).json({ msg: "Lo sentimos, debes enviar el ID del negocio a eliminar" });
        }
        const negocioBDD = await Negocios.findById(negocioId);
        if (!negocioBDD) {
            return res.status(404).json({ msg: "Lo sentimos, no existe el negocio" });
        }
        if (negocioBDD.jefeId.toString() !== id) {
            return res.status(403).json({ msg: "Lo sentimos, no tienes permiso para eliminar este negocio" });
        }
        negocioBDD.isDeleted = true;
        const jefeBDD = await Boss.findById(id);
        if (!jefeBDD) return res.status(404).json({ msg: "Lo sentimos, no existe el jefe" });
        await jefeBDD.save();
        await negocioBDD.save();
        res.status(200).json({ msg: "Negocio eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};


export {
    createNegocio,
    addEmployee,
    deleteNegocio,
    listNegocios
}