import Negocios from "../models/negocios.js";
import Boss from "../models/jefes.js";
import Employees from "../models/empleados.js";
import Productividad from "../models/productividad.js";
import { sendMailToRegisterNegocio, sendMailToDeleteEmployee } from "../config/nodemailer_negocios.js"
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs-extra";


const createNegocio = async (req, res) => {
    const { id } = req.jefeBDD;
    const { companyName, ruc } = req.body;
    if (ruc.length !== 13 || !/^\d+$/.test(ruc)) {
        return res.status(400).json({ msg: "Lo sentimos, el RUC debe tener exactamente 13 dígitos numéricos" });
    }
    const existingNegocio = await Negocios.findOne({ ruc });
    if (existingNegocio) {
        return res.status(400).json({ msg: "Lo sentimos, el negocio ya se encuentra registrado" });
    }
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes de llenar todos los datos" });
    }
    const jefeDBB = await Boss.findById(id);
    if (!jefeDBB) {
        return res.status(404).json({ msg: "Jefe no encontrado" });
    }
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
    if (!verifyRuc) {
        return res.status(400).json({ msg: "Lo sentimos, el RUC no es válido" });
    }
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
        const { id } = req.jefeBDD;
        const jefeBDD = await Boss.findById(id)
            .select("companyNames") 
            .populate("companyNames", "_id");  
        if (!jefeBDD || !jefeBDD.companyNames.length) {
            return res.status(404).json({ msg: "No se encontraron negocios" });
        }
        const companyIds = jefeBDD.companyNames.map(company => company._id);
        const negocios = await Promise.all(
            companyIds.map(async (companyId) => {
                const company = await Negocios.findById(companyId);
                if (company && !company.isDeleted) {
                    return { 
                        _id: company._id, 
                        name: company.name,
                        companyName: company.companyName,
                        companyCode: company.companyCode,
                        ruc: company.ruc,
                        status: company.status,
                        logo: company.logo
                    }; 
                }
                return null;
            })
        );
        const validNegocios = negocios.filter(negocio => negocio !== null);
        if (!validNegocios.length) {
            return res.status(404).json({ msg: "No se encontraron negocios activos" });
        }
        return res.status(200).json({ companyNames: validNegocios });

    } catch (error) {
        console.error('Error al obtener negocios:', error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const detalleNegocio = async (req, res) => {
    const { negocioId } = req.params;
    if (!negocioId) {
        return res.status(400).json({ msg: "Lo sentimos, debes enviar el ID del negocio" });
    }
    const negocioBDD = await Negocios.findById(negocioId).select("-__v -createdAt -updatedAt -logoID -isDeleted").populate("emailBoss", "nombres apellidos email foto").populate("empleados", "_id nombres apellidos email").populate("reportes", "_id fecha ventasCompletadas horasTrabajadas comentarios");
    if (!negocioBDD) {
        return res.status(404).json({ msg: "Lo sentimos, no existe el negocio" });
    }
    return res.status(200).json(negocioBDD);
};

const updateNegocio = async (req, res) => {
    try {
        const { negocioId } = req.params;
        const { companyName, ruc, telefono, emailNegocio, descripcion } = req.body;
        if (!mongoose.Types.ObjectId.isValid(negocioId))
            return res.status(404).json({ msg: "Lo sentimos, debe ser un id" });
        if (Object.values(req.body).includes(""))
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        const negocioBDD = await Negocios.findById(negocioId);
        if (!negocioBDD)
            return res.status(404).json({ msg: `Lo sentimos, no existe el negocio` });
        if (negocioBDD.emailNegocio !== emailNegocio) {
            const negocioBDDEmail = await Negocios.findOne({ emailNegocio });
            if (negocioBDDEmail)
                return res.status(409).json({ msg: `Lo sentimos, el email ${emailNegocio} ya se encuentra registrado` });
        }
        if(req.files?.foto){
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.foto.tempFilePath,{folder:'Negocios'});
            negocioBDD.logo = secure_url;
            negocioBDD.logoID = public_id;
            await fs.unlink(req.files.foto.tempFilePath);
        }
        negocioBDD.companyName = companyName ?? negocioBDD.companyName;
        negocioBDD.ruc = ruc ?? negocioBDD.ruc;
        negocioBDD.telefono = telefono ?? negocioBDD.telefono;
        negocioBDD.emailNegocio = emailNegocio ?? negocioBDD.emailNegocio;
        negocioBDD.descripcion = descripcion ?? negocioBDD.descripcion;
        await negocioBDD.save();
        const negocioActualizado = await Negocios.findById(negocioId).select("-__v -createdAt -updatedAt -logoID -isDeleted").populate("emailBoss", "nombres apellidos email foto");
        res.status(200).json({
            msg: "Datos actualizados correctamente",
            data: negocioActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const addEmployee = async (req, res) => {
    const {emailEmpleado} = req.body;
    const empleadoRegistrado = await Employees.findOne({email: emailEmpleado});
    if (Object.values(req.body).includes(""))
        return res.status(400).json({msg:"Lo sentimos, debes de llenar todo los datos"});
    if (empleadoRegistrado) {
        return res.status(400).json({msg:"Lo sentimos, el empleado ya se encuentra registrado"});
    }
    const negocioDBB = await Negocios.findOne({emailBoss: req.jefeBDD._id});
    if (!negocioDBB)
        return res.status(404).json({msg:"Lo sentimos, el negocio no se encuentra registrado"});
    await sendMailToRegisterNegocio(emailEmpleado, negocioDBB.companyName, negocioDBB.companyCode, "Empleado");
    res.status(200).json({msg:"Tu empleado fue añadido al negocio correctamente"});
};

const listEmployees = async (req, res) => {
    const { negocioId } = req.params;
    if (!negocioId) {
        return res.status(400).json({ msg: "Lo sentimos, debes enviar el ID del negocio" });
    }
    const negocioBDD = await Negocios.findById(negocioId)
        .select("-__v -createdAt -updatedAt -logoID -isDeleted")
        .populate("empleados", "nombres apellidos email foto status");
    if (!negocioBDD) {
        return res.status(404).json({ msg: "Lo sentimos, no existe el negocio" });
    }
    if (!negocioBDD.empleados || negocioBDD.empleados.length === 0) {
        return res.status(404).json({ msg: "No hay empleados registrados en este negocio" });
    }
    return res.status(200).json(negocioBDD.empleados);
};


const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ msg: "Lo sentimos, debes enviar el ID del empleado" });
    }
    const negocioDBB = await Negocios.findOne({ emailBoss: req.jefeBDD._id });
    if (!negocioDBB) {
        return res.status(404).json({ msg: "Lo sentimos, el negocio no se encuentra registrado" });
    }
    await sendMailToDeleteEmployee(negocioDBB.emailNegocio, negocioDBB.companyName);
    res.status(200).json({ msg: "Tu empleado fue eliminado del negocio correctamente" });
};

const deleteNegocio = async (req, res) => {
    try {
        const { id } = req.jefeBDD; 
        const { negocioId } = req.params; 
        if (!negocioId) {
            return res.status(400).json({ msg: "Lo sentimos, debes enviar el ID del negocio a eliminar" });
        }
        const negocioBDD = await Negocios.findById(negocioId);
        if (!negocioBDD) {
            return res.status(404).json({ msg: "Lo sentimos, no existe el negocio" });
        }
        if (negocioBDD.emailBoss.toString() !== id) {
            return res.status(403).json({ msg: "Lo sentimos, no tienes permiso para eliminar este negocio" });
        }
        negocioBDD.isDeleted = true;
        await negocioBDD.save();
        res.status(200).json({ msg: "Negocio eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const reportEmployee = async (req, res) => {
    const { empleadoId, negocioId } = req.params;
    const { fecha, ventasCompletadas, horasTrabajadas, comentarios } = req.body;
    if (!mongoose.Types.ObjectId.isValid(empleadoId)) {
        return res.status(400).json({ msg: "Lo sentimos, el ID del empleado no es válido" });
    }
    if (!mongoose.Types.ObjectId.isValid(negocioId)) {
        return res.status(400).json({ msg: "Lo sentimos, el ID del negocio no es válido" });
    }
    if (!fecha || !ventasCompletadas || !horasTrabajadas) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos obligatorios" });
    }
    try {
        const empleado = await Employees.findById(empleadoId);
        if (!empleado) {
            return res.status(404).json({ msg: "El empleado no fue encontrado" });
        }
        const negocio = await Negocios.findById(negocioId);
        if (!negocio) {
            return res.status(404).json({ msg: "El negocio no fue encontrado" });
        }
        const nuevoReporte = new Productividad({
            empleadoId,
            negocioId,  
            fecha,
            ventasCompletadas,
            horasTrabajadas,
            comentarios
        });
        await nuevoReporte.save();
        await Negocios.findByIdAndUpdate(negocioId, { $push: { reportes: nuevoReporte._id } });
        await Employees.findByIdAndUpdate(empleadoId, { $push: { reportes: nuevoReporte._id } });
        const reporteConEmpleado = await Productividad.findById(nuevoReporte._id)
            .select('-__v -createdAt -updatedAt')
            .populate('empleadoId', 'nombres apellidos email foto')
            .populate('negocioId', 'companyName');
        res.status(201).json({
            msg: 'Reporte de productividad generado exitosamente',
            reporte: reporteConEmpleado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al generar el reporte de productividad', error: error.message });
    }
};

const listReport = async (req, res) => {
    const { negocioId } = req.params;
    if (!negocioId) {
        return res.status(400).json({ msg: "Lo sentimos, debes enviar el ID del negocio" });
    }
    try {
        const reportes = await Productividad.find({ negocioId })
            .select('-__v -createdAt -updatedAt')
            .populate('empleadoId', 'nombres apellidos email foto')
            .populate('negocioId', 'companyName');
        if (!reportes || reportes.length === 0) {
            return res.status(404).json({ msg: "No se encontraron reportes para este negocio" });
        }
        res.status(200).json({ msg: "Reportes del negocio", reportes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const listEmployeesReport = async (req, res) => {
    const { empleadoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(empleadoId)) {
        return res.status(400).json({ msg: "Lo sentimos, el ID del empleado no es válido" });
    }
    try {
        const reportes = await Productividad.find({ empleadoId })
            .select('-__v -createdAt -updatedAt')
            .populate('empleadoId', 'nombres apellidos email foto')
            .populate('negocioId', 'companyName');
        if (!reportes || reportes.length === 0) {
            return res.status(404).json({ msg: "No se encontraron reportes para este empleado" });
        }
        res.status(200).json({ msg: "Reportes del empleado", reportes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor", error: error.message });
    }
};

export {
    createNegocio,
    addEmployee,
    listEmployees,
    deleteNegocio,
    reportEmployee,
    listNegocios,
    detalleNegocio,
    updateNegocio,
    deleteEmployee,
    listReport,
    listEmployeesReport
}