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
    emailNegocio: {
        type: String,
        required: true,
        trim: true
    },
    emailBoss: {
        type: Schema.Types.ObjectId,
        ref: 'Jefes',
        required: true
    },
    empleados: [{
        type: Schema.Types.ObjectId,
        ref: 'Empleados'
    }],
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    logo: {
        type: String,
        default: "https://res.cloudinary.com/dmccize09/image/upload/v1752099442/Administradores/gjypqxqip7qmud3at6wc.png",
        trim: true
    },
    logoID: {
        type: String,
        default: "Administradores/gjypqxqip7qmud3at6wc",
        trim: true
    },
    reportes: [{
        type: Schema.Types.ObjectId,
        ref: 'Productividad'
    }]
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

negocioSchema.methods.verifyRuc = async function (ruc) {
    return /^\d{13}$/.test(ruc);
};

export default model('Negocios', negocioSchema);
