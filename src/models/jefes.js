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
        default: "jefe"
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

// 2. Método para verificar si el password ingresado es     el mismo de la BDD
jefeSchema.methods.matchPassword =  async function (password) {
    const response = await bcrypt.compare(password, this.password);
    return response;
}

// 3. Método para crear un token
jefeSchema.methods.createToken = async function () {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2);
    return tokenGenerado;
}

export default model('Jefes', jefeSchema);
