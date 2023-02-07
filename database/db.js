import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
// mongodb://0.0.0.0:27017/blog-web
// process.env.DB_URL
mongoose.set('strictQuery', false);

const Connection = () => {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Database connected successfully');
}
export default Connection;