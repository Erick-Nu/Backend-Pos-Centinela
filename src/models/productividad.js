import {Schema, model, modelNames} from 'mongoose';

const productividadSchema = new Schema({
    empleadoId: { 
        type: Schema.Types.ObjectId, 
        ref: "Empleados",
        required: true 
    },
    negocioId: {
        type: Schema.Types.ObjectId,
        ref: "Negocios",
        required: true
    },
    fecha: {
        type: Date,
        required: true,
    },
    ventasCompletadas: {
        type: Number,
        required: true,
    },
    horasTrabajadas: {
        type: Number,
        required: true,
    },
    comentarios: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

export default model('Productividad', productividadSchema);