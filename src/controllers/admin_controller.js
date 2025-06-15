import Administrador from "../models/administradores.js"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"

const registroAdmin = async (req,res)=>{
    const {email,password,cedula} = req.body
    if (Object.values(req.body).includes("")) 
        return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const verificarEmailBDD = await Administrador.findOne({email})
    if(verificarEmailBDD) 
        return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"});
    const verificarCedulaBDD = await Administrador.findOne({cedula})
    if(verificarCedulaBDD) 
        return res.status(400).json({msg:"Lo sentimos, la cédula ya se encuentra registrada"});
    const nuevoAdmin = new Administrador(req.body);
    nuevoAdmin.password = await nuevoAdmin.encrypPassword(password);
    const token = await nuevoAdmin.crearToken();
    const adminCode = await nuevoAdmin.createCode(nuevoAdmin.nombres, nuevoAdmin.apellidos, nuevoAdmin.cedula);
    nuevoAdmin.adminCode = adminCode;
    const rol = nuevoAdmin.rol;
    await sendMailToRegister(email,token,adminCode,rol,password);
    await nuevoAdmin.save();
    res.status(200).json({msg:"Administrador registrado correctamente, revisa tu correo electrónico para confirmar tu cuenta"});
}

const confirmarMail = async (req,res)=>{
    const token = req.params.token;
    const centinelaBDD = await Administrador.findOne({token});
    if(!centinelaBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"});
    centinelaBDD.token = null;
    centinelaBDD.confirmEmail=true;
    await centinelaBDD.save();
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"});
}

const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"});
    const administradorBDD = await Administrador.findOne({email});
    if(!administradorBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"});
    const token = administradorBDD.crearToken();
    administradorBDD.token = token;
    const adminCode = administradorBDD.adminCode;
    const rol = administradorBDD.rol;
    await sendMailToRecoveryPassword(email, token, adminCode, rol);
    await administradorBDD.save();
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"});
}

const comprobarTokenPasword = async (req,res)=>{
    const token = req.params.token
    const administradorBDD = await Administrador.findOne({token})
    if(administradorBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await administradorBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}

const crearNuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const administradorBDD = await Administrador.findOne({token:req.params.token})
    if(administradorBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    administradorBDD.token = null
    administradorBDD.password = await administradorBDD.encrypPassword(password)
    await administradorBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

const loginAdmin = async(req,res)=>{
    const {email, password, adminCode} = req.body;
    if (Object.values(req.body).includes("")) 
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    const administradorBDD = await Administrador.findOne({ email }).select("-__v -token -updatedAt -createdAt");
    if (!administradorBDD)
        return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
    if (administradorBDD.confirmEmail === false)
        return res.status(403).json({ msg: "Lo sentimos, debe verificar su cuenta" });
    const verificarPassword = await administradorBDD.matchPassword(password);
    if (!verificarPassword)
        return res.status(401).json({ msg: "Lo sentimos, el password no es el correcto" });
    const verificarCode = await Administrador.findOne({ adminCode });
    if (!verificarCode)
        return res.status(401).json({ msg: "Lo sentimos, tu código de administrador no es correcto" });
    const { nombres, apellidos, cedula, _id, rol } = administradorBDD;
    res.status(200).json({
        nombres,
        apellidos,
        cedula,
        adminCode: administradorBDD.adminCode,
        email: administradorBDD.email,
        rol,
        _id
    });
};


// Metodos Personalizadas para el administrador [Actualizar Perfil]
const updateFace = async (req, res) => {
    const { email, nombres, apellidos } = req.body;

    // Buscar administrador
    const administradorBDD = await Administrador.findOne({ email });
    if (!administradorBDD) {
        return res.status(404).json({ msg: "El administrador no existe" });
    }

    // Actualizar campos si fueron enviados
    if (nombres) administradorBDD.nombres = nombres;
    if (apellidos) administradorBDD.apellidos = apellidos;

    // Guardar cambios
    await administradorBDD.save();
    return res.status(200).json({ msg: "Perfil actualizado correctamente", persona: administradorBDD });
};



export {
    registroAdmin,
    confirmarMail,
    updateFace,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    loginAdmin
}
