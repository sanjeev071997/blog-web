import express from 'express';
import { createComment, getAllComments, deleteComment } from '../controller/comments/commentsController.js';
import {isAuthenticatedUser, authorizeRole} from '../middleware/authenticatedUser.js';

const router = express.Router();

router.post('/', isAuthenticatedUser, createComment);

router.get('/:id',  getAllComments)

router.delete('/delete/:id', isAuthenticatedUser, deleteComment);


export default router;