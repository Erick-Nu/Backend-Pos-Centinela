import Boss from "../models/jefes.js"
import { sendMailToNewBoss, sendMailToRecoveryPasswordBoss } from "../config/nodemailer.js"

const registerBoss = async (req,res)=>{
    const {email,password} = req.body
    // Verificación de campos vacios en el documento JSON 
    if (Object.values(req.body).includes("")) 
        return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    // Verificación del email (si existe o no)
    const verificarEmailBDD = await Boss.findOne({email})
    if(verificarEmailBDD) 
        return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    // Registro de nuevo usuario
    const nuevoBoss = new Boss(req.body)
    // Encriptación de la contraseña
    nuevoBoss.password = await nuevoBoss.encrypPassword(password)
    const token = await nuevoBoss.createToken()
    await sendMailToNewBoss(email,token)
    await nuevoBoss.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}

const confirmEmail = async (req,res)=>{
    const token = req.params.token
    const centinelaBDD = await Boss.findOne({token})
    if(!centinelaBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    centinelaBDD.token = null
    centinelaBDD.confirmEmail=true
    await centinelaBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
}

const recoverPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const BossBDD = await Boss.findOne({email})
    if(!BossBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = await BossBDD.createToken()
    BossBDD.token=token
    await sendMailToRecoveryPasswordBoss(email,token)
    await BossBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}

const comprobarTokenPasword = async (req,res)=>{
    const token = req.params.token
    const BossBDD = await Boss.findOne({token})
    if(BossBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await BossBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}

const createNewPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const BossBDD = await Boss.findOne({token:req.params.token})
    if(BossBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    BossBDD.token = null
    BossBDD.password = await BossBDD.encrypPassword(password)
    await BossBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

export {
    registerBoss,
    confirmEmail,
    recoverPassword,
    comprobarTokenPasword,
    createNewPassword
};