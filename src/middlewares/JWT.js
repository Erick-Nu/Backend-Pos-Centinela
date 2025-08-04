import jwt from 'jsonwebtoken';
import Administrador from '../models/administradores.js';
import Boss from '../models/jefes.js';
import Empleado from '../models/empleados.js';

const createTokenJWT = (id, rol) => {
    return jwt.sign({id, rol}, process.env.JWT_SECRET, {expiresIn: '1d'});
};

const verifyTokenJWT = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization)
        return res.status(401).json({ msg: "Acceso denegado: Token no proporcionado" });

    try {
        const token = authorization.split(' ')[1];
        const { id, rol } = jwt.verify(token, process.env.JWT_SECRET);

        if (rol === 'administrador') {
        req.administradorBDD = await Administrador.findById(id).select('-password -token -__v -isDeleted');
        } else if (rol === 'jefe') {
        req.jefeDBB = await Boss.findById(id).select('-password -token -__v -isDeleted');
        } else if (rol === 'empleado') {
        req.empleadoBDD = await Empleado.findById(id).select('-password -token -__v -isDeleted');
        } else {
        return res.status(401).json({ msg: "Acceso denegado: Rol no reconocido" });
        }
        next(); 

    } catch (error) {
        return res.status(401).json({ msg: "Acceso denegado: Token inválido o expirado" });
    }
};

export {
    createTokenJWT,
    verifyTokenJWT
};
