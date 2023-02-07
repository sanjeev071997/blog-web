import express from 'express';
import { createPost, updatePost, deletePost, postDetails, getAllPost, search,  } from '../controller/post/postController.js'
import {isAuthenticatedUser, authorizeRole} from '../middleware/authenticatedUser.js';

const router = express.Router();

router.post('/', isAuthenticatedUser, createPost)

router.put('/:id',isAuthenticatedUser,  updatePost)

router.delete('/delete/:id', isAuthenticatedUser, deletePost)

router.get('/', getAllPost) 

router.get('/details/:id', postDetails)

router.get('/search', search)

export default router;