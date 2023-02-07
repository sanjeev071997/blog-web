import express from 'express';
import { createContact, getAllContact } from '../controller/contact/contactController.js'
import {isAuthenticatedUser, authorizeRole} from '../middleware/authenticatedUser.js';

const router = express.Router();

router.post('/',isAuthenticatedUser, createContact);

// Admin 
router.get('/all', isAuthenticatedUser,authorizeRole('admin'), getAllContact);


export default router;