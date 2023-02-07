import mongoose from "mongoose";
import validator from 'validator';

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxlength: [30, "Name cannot exceed 30 characters"],
        minlength: [4, "Name should have more than 4 characters"],
    },

    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        validate: [validator.isEmail, "Please Enter A Valid Email"],
    },

    message: {
        type: String,
        required: [true, "Please Enter Your Message"],
    },
});

const contact = mongoose.model("Contact", ContactSchema);
export default contact;