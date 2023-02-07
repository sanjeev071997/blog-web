import User from '../../models/user/UserModels.js';
import ErrorHander from '../../utils/errorhander.js'
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import sendToken from '../../utils/jwtToken.js';
import sendEmail from '../../utils/sendUserEmail.js';
import crypto from 'crypto';
import cloudinary from '../../utils/cloudinary.js';

// Create User profilePic
export const register = catchAsyncErrors(async (req, res, next) => {
    // upload cloudinary image
    const file = req.files.profile // frontend name (profile)
    const myCloud = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `${Date.now()}`,
        resource_type: 'auto',
        folder: "Blog-web-user",
        width: 150,
        crop: "scale"
    });

    const { username, email, password, profile } = req.body;
    // save new user database
    const user = await User.create({
        username,
        email,
        password,
        profile: myCloud.url,
    });
    sendToken(user, 201, res);
});



// Login User
export const login = catchAsyncErrors(async (req, res, next) => {
    const { username, password } = req.body;

    // checking if user has given password and email both
    if (!username || !password) {
        return next(new ErrorHander("Please Enter Username & Password", 400))
    }

    const user = await User.findOne({ username: username, active: true }).select("+password");
    if (!user) {
        return next(new ErrorHander("Invalid username or password", 401))
    }

    // Compare Password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHander("Invalid username or password", 401))
    };
    // res.status(200).json(user)
    sendToken(user, 200, res);

});


// Logout User
export const logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logged Out"
    });

});


// Forgot Password
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email, active: true });

    if (!user) {
        return next(new ErrorHander('User not found', 404))
    };

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/auth/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.\n\n Thank you!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Blog Password Recovery',
            message,
        })

        res.status(200).json({
            success: true,
            message: `sending to ${user.email} email successfully.Please check your email.`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHander(error.message, 500))
    };
});

// Reset Password (confirm password)
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHander("Reset Password Token is invalid or has been expired", 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not match"))
    };

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res)
});

// profile (Get User Details)
export const profileDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('postSenderId');
    res.status(200).json({
        success: true,
        user,
    });
});

// profile update 
export const profileUpdate = catchAsyncErrors(async (req, res, next) => {
    const myCloud = await cloudinary.uploader.upload(req.files.profile.tempFilePath, {
        public_id: `${Date.now()}`,
        folder: "Blog-web-user",
        width: 150,
        crop: "scale",
    });
    const newUserData = {
        username: req.body.username,
        email: req.body.email,
        profile: myCloud.url,
        // senderId: req.Post      // Update send post user 
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        user
    })
})

// profile update password
export const profileUpdatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Old password is incorrect", 400))
    };

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not match", 400))
    };

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res)
});

// profile delete (account delete)
export const profileDelete = catchAsyncErrors(async (req, res, next) => {
    await User.findByIdAndUpdate({ _id: req.params.id }, { "$set": { "active": false } });
    // await User.remove();
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "Your Account Is Deleted Successfully"
    });
});

// Recover Account(profile) Send Email
export const recoverAccount = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHander('User not found', 404))
    };

    // Get Recover Account Token
    const recoverToken = user.getRecoverAccountToken();
    await user.save({ validateBeforeSave: false });

    const recoverAccountUrl = `${process.env.FRONTEND_URL}/recover/account/login/${recoverToken}`;

    const message = `Your account recover token is :- \n\n ${recoverAccountUrl} \n\n If you have not requested this email then, please ignore it.\n\n Thank you!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Blog Account Recovery',
            message,
        })

        res.status(200).json({
            success: true,
            message: `sending to ${user.email} email successfully.Please check your email.`
        })
    } catch (error) {
        user.recoverAccountToken = undefined;
        user.recoverAccountExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHander(error.message, 500))

    };

});

// Recover Account(profile) Login User
export const recoverAccountLogin = catchAsyncErrors(async (req, res, next) => {
    const { username, password, _id } = req.body;

    // checking if user has given password and email both
    if (!username || !password) {
        return next(new ErrorHander("User not found. Please try again", 400))
    }

    const user = await User.findOne({ username: username, "active": false }).select("+password");
    if (!user) {
        return next(new ErrorHander("User not found. Please try again", 401))
    }
    await User.findOneAndUpdate({ active: false }, { "active": true })

    // Compare Password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHander("User not found. Please try again", 401))
    };
    sendToken(user, 200, res);

});

// Admin
// get all user (Admin)senderId: req.Post 
export const getAllUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.find()

    res.status(200).json(user);
});


// search all user (Admin)
export const search = catchAsyncErrors(async (req, res, next) => {
    const search = await User.find({
        "$or": [
            { username: { $regex: req.params.key } },
            { email: { $regex: req.params.key } },
            { role: { $regex: req.params.key } },
        ]
    });

    res.status(200).json({
        success: true,
        search,
    });

});