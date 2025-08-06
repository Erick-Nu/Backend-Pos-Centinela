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
    companyNames:[{
        type: Schema.Types.ObjectId,
        ref: 'Negocios',
        required: true
    }],
    companyCodes:[{
        type: String,
        default: null,
        trim: true
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    numVentas:{
        type:Number,
        default:0
    },
    reportes:[{
        type: Schema.Types.ObjectId,
        ref: 'Reportes'
    }]
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

