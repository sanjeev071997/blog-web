import Contact from "../../models/contact/contactModels.js";
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';

// create contact 
export const createContact = catchAsyncErrors(async( req, res, next) => {
    const {name, email, message} = req.body
    const contact = await Contact.create({
        name,
        email,
        message,
    });
    res.status(201).json({
        success: true,
        contact,
        message:'Thank you for your response'
    });
    
});

// get all contact (Admin)
export const getAllContact = catchAsyncErrors(async( req, res, next) => {
    const contact = await Contact.find()

    res.status(200).json({
        success: true,
        contact
    });
});
