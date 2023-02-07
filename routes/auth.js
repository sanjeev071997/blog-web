import express from 'express';
import {
    register, getAllUser, login, logout, forgotPassword, resetPassword, profileDetails,
    profileUpdate, profileUpdatePassword, profileDelete, search, recoverAccount,
    recoverAccountLogin
} from '../controller/auth/authController.js';
import { isAuthenticatedUser, authorizeRole } from '../middleware/authenticatedUser.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/logout', logout);

router.post('/password/forgot', forgotPassword);

router.put('/password/reset/:token', resetPassword);

router.get('/profile', isAuthenticatedUser, profileDetails)

router.put('/profile/update', isAuthenticatedUser, profileUpdate)

router.put('/profile/password/update', isAuthenticatedUser, profileUpdatePassword) // Change password

router.delete('/profile/account/delete/:id', isAuthenticatedUser, profileDelete);

router.post('/recover/account', recoverAccount);

router.post('/recover/account/login/:token', recoverAccountLogin);

router.get('/search/:key', search)

// Admin 
router.get('/user', isAuthenticatedUser, authorizeRole('admin'), getAllUser);

export default router; 