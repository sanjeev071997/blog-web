import mongoose from "mongoose";
import validator from 'validator';
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

dotenv.config();

const UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        trim: true,
        unique:[true, "Please Enter Your Username"],
        required: [true, "Please Enter Your Username"],
        maxlength: [30, "Name cannot exceed 30 characters"],
        minlength: [4, "Name should have more than 4 characters"],
    },

    email: { 
        type: String,
        trim: true,
        unique: true,
        required: [true, "Please Enter Your Email"],
        validate: [validator.isEmail, "Please Enter A Valid Email"],
    },

    password: {
        type: String,
        trim: true,
        required: [true, "Please Enter Your Password"],
        minlength: [8, "Password should be greater than 8 characters"],
        select: false,
    },

    profile:{
        type: String,
        default:'', 
        required: false,
    },

    role: {
        type: String,
        default: "user",
    },

    active: { 
        type: Boolean, 
        default: true, 
    },

    postSenderId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Post',
    },

    commentSenderId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Comment',
    },

    resetPasswordToken: String,
    
    resetPasswordExpire: Date,

    recoverAccountToken: String,
    
    recoverAccountExpire: Date,
},
    { timestamps: true }
);

// Before saving, hash the password and save it in the database
UserSchema.pre("save", async function(next) {
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password,10)
});

// Compare Password 
UserSchema.methods.comparePassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create JWT TOKEN
UserSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};
 
// Generating password Reset Token (Forgot Password)
UserSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(40).toString('hex')
    // Hashing and adding resetPasswordToken to UserSchema
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

// Generating Recover Account Token (Forgot Password)
UserSchema.methods.getRecoverAccountToken = function () {
    // Generating Token
    const recoverToken = crypto.randomBytes(40).toString('hex')
    // Hashing and adding recoverAccountToken to UserSchema
    this.recoverAccountToken = crypto.createHash('sha256').update(recoverToken).digest('hex')
    this.recoverAccountExpire = Date.now() + 10 * 60 * 1000;
    return recoverToken;
};

const user = mongoose.model("User", UserSchema);
export default user;