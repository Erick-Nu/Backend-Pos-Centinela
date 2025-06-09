// Biblioteca ODM
import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

const connection = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI_PRODUCTION)
        console.log(`✅ MongoDB Atlas connected to: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ Error: MongoDB Atlas could not connect');
        console.error(error);
        process.exit(1); 
    }
}
export default  connection;