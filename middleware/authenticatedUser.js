import ErrorHander from "../utils/errorhander.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from 'jsonwebtoken'
import User from "../models/user/UserModels.js";

// authenticated user
export const isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {
    const {token} = req.cookies;
    if(!token) {
        return next(new ErrorHander("Please Login to access this resource", 401))
    }
    const decodedDate = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedDate.id);
    next();
});

// admin authorize role
export const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(req.user.role, "req.user.role")
            return next (
                new ErrorHander(
                    `Role: ${req.user.role} is not allowed to access this resource`, 403
                )
            );
        }
        next();
    };
};

