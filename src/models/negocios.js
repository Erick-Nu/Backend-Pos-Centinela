import { Schema, model } from "mongoose";

const negocioSchema = new Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    companyCode:{
        type: String,
        unique: true,
        default: null,
        trim:true
    },
    ruc: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        trim: true
    },
    direccion: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    emailContacto: {
        type: String,
        required: true,
        trim: true
    },
    emailBoss: {
        type: Schema.Types.ObjectId,
        ref: 'jefes',
        required: true
    },
    empleados: [{
        type: Schema.Types.ObjectId,
        ref: 'empleados'
    }],
    status: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

// 1. Crear codigo del emprendimiento
negocioSchema.methods.createCode = async function (companyName) {
    const initials = companyName.split(' ').map(word => word[0]?.toUpperCase() || '').join('');
    const year = new Date().getFullYear();
    const code = `${initials}${year}`;
    this.companyCode = code;
    return code;
}

export default model('Negocios', negocioSchema);
