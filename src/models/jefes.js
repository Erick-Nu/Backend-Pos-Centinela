import {Schema, model, modelNames} from 'mongoose';
import bcrypt from 'bcryptjs';

const jefeSchema = new Schema({
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
        required: true,
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
    foto: {
        type: String,
        default: "https://res.cloudinary.com/dmccize09/image/upload/v1752099442/Administradores/gjypqxqip7qmud3at6wc.png",
        trim: true
    },
    fotoID: {
        type: String,
        default: "Administradores/gjypqxqip7qmud3at6wc",
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
        default: "jefe"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    companyNames:[{
        type: Schema.Types.ObjectId,
        ref: 'Negocios'
    }],
    companyCodes:[{
        type: String,
        default: null
    }],
    plan:{
        type: String,
        enum: ['starter', 'business', 'enterprise'],
        default: 'starter'
    },
    authGoogle: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// 1. Cifrado de contraseña
jefeSchema.methods.encrypPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    const passwordEncryp = await bcrypt.hash(password, salt);
    return passwordEncryp;
};

// 2. Método para verificar si el password ingresado es el mismo de la BDD
jefeSchema.methods.matchPassword =  async function (password) {
    const response = await bcrypt.compare(password, this.password);
    return response;
};

// 3. Método para crear un token
jefeSchema.methods.createToken = async function () {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2);
    return tokenGenerado;
};


export default model('Jefes', jefeSchema);
