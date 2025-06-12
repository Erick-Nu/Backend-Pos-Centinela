// Librerias

import {Schema, model, modelNames} from 'mongoose';
import bcrypt from 'bcryptjs';

const empleadoSchema = new Schema({
    nombres: {
        type: String,
        required: true,
        trim: true
    },
    apellidos: {
        type: String,
        required: true,
        trim: true
    },
    cedula: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        default: null
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    rol: {
        type: String,
        default: "empleado"
    },
    companyName:{
        type: Schema.Types.ObjectId,
        ref: 'negocios',
        required: true
    },
    companyCode:{
        type: String,
        default: null,
        trim: true
    }
}, {
    timestamps: true
});

// Métodos para el empleado

// 1. Cifrado de contraseña
empleadoSchema.methods.encrypPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    const passwordEncryp = await bcrypt.hash(password, salt);
    return passwordEncryp;
};

// 2. Método para verificar si el password ingresado es     el mismo de la BDD
empleadoSchema.methods.matchPassword =  async function (password) {
    const response = await bcrypt.compare(password, this.password);
    return response;
}

// 3. Método para crear un token
empleadoSchema.methods.createToken = async function () {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2);
    return tokenGenerado;
}

export default model('Empleados', empleadoSchema);

