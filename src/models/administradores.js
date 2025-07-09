// Libreriras
import { Schema, model } from 'mongoose'; 
import bcrypt from "bcryptjs";

const administradorSchema = new Schema({
    nombres:{
        type:String,
        required:true,
        trim:true
    },
    apellidos:{
        type:String,
        required:true,
        trim:true
    },
    cedula: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        trim:true,
		unique:true
    },
    password:{
        type:String,
        required:true
    },
    foto:{
        type:String,
        default:"https://res.cloudinary.com/dmccize09/image/upload/v1752099442/Administradores/gjypqxqip7qmud3at6wc.png",
        trim: true
    },
    fotoID:{
        type:String,
        default:"Administradores/gjypqxqip7qmud3at6wc",
        trim: true
    },
    adminCode:{
        type:String,
        unique: true,
        trim:true
    },
    status:{
        type:Boolean,
        default:true
    },
    token:{
        type:String,
        default:null
    },
    confirmEmail:{
        type:Boolean,
        default:false
    },
    rol:{
        type:String,
        default:"administrador"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{
    timestamps:true
})

// Método para cifrar el password 
administradorSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}

// Método para verificar si el password ingresado es el mismo de la BDD
administradorSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}

// Método para crear un token 
administradorSchema.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}

// Método para crear el codigo del administrador para su ingreso
administradorSchema.methods.createCode = async function(nombres, apellidos, cedula) {
    const fullName = `${nombres} ${apellidos}`;
    const initials = fullName.split(' ').map(word => word[0]?.toUpperCase() || '').join('');
    const cedulaDigits = cedula.slice(-4);
    const month = new Date().getMonth() + 1;
    const code = `${initials}${month}${cedulaDigits}`;
    this.adminCode = code;
    return code;
};

// Método para crear una contraseña temporal
administradorSchema.methods.createTemporaryPassword = async function(nombres, cedula) {
    const primerNombre = nombres.split(' ')[0].toLowerCase();
    const ultimosDigitos = cedula.slice(-3);
    const caracteresEspeciales = ['*', '.', '#', '@', '-', '_'];
    const randomChar = caracteresEspeciales[Math.floor(Math.random() * caracteresEspeciales.length)];
    const temporaryPassword = `${primerNombre}${ultimosDigitos}${randomChar}`;
    return temporaryPassword;
};


export default model('Administradores',administradorSchema)