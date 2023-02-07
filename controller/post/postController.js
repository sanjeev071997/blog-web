import Post from "../../models/post/PostModels.js";
import User from "../../models/user/UserModels.js";
import catchAsyncErrors from "../../middleware/catchAsyncErrors.js";
import ErrorHander from "../../utils/errorhander.js";
import cloudinary from "../../utils/cloudinary.js";
import ApiFeatures from "../../utils/apifeatures.js";


// Create Post
export const createPost = catchAsyncErrors(async (req, res, next) => {
    const { title, desc, username, image, userprofile } = req.body;
    // upload cloudinary image
    const file = req.files.image // frontend name (image)
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `${Date.now()}`,
        resource_type: 'auto',
        folder: "Blog-web-post",
    });
    // save new post database
    const newPost = await Post.create({
        title,
        desc,
        username,
        image: result.url,
        userprofile,
        senderId: req.user,      // user 
    });
    res.status(201).json({
        success: true,
        newPost,
    });
});

// update post 
export const updatePost = catchAsyncErrors(async (req, res, next) => {
    // upload cloudinary image
    const file = req.files.image // frontend name (image)
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `${Date.now()}`,
        resource_type: 'auto',
        folder: "Blog-web-post",
    });
    const updatePost = {
        username: req.body.username,
        title: req.body.title,
        desc: req.body.desc,
        image: result.url,
    }
    const newUpdatePost = await Post.findByIdAndUpdate(req.params.id, updatePost, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        newUpdatePost
    })
})

// delete post 
export const deletePost = catchAsyncErrors(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (req.body.username) {
        try {
            await post.delete();
            res.status(200).json({
                success: true,
                message: "Post has been deleted",
            })
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        return next(new ErrorHander(error.message, 500))
    };
});

// single post details
export const postDetails = catchAsyncErrors(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate({path:'senderId',select:['username', 'profile']});
    res.status(200).json(post)
});

// Get all post 
export const getAllPost = catchAsyncErrors(async (req, res, next) => {
    const username = req.query.user;
    let posts;
    if (username){
    posts = await Post.find({ username: username }).populate({path:'senderId',select:['username', 'profile', "active"]});
    }else{
        posts = await Post.find().populate({path:'senderId',select:['username', 'profile', "active"]});
    }
    res.status(200).json(posts);
});

// search all posts
export const search = catchAsyncErrors(async (req, res, next) => {
   const apiFeature = new ApiFeatures(Post.find(), req.query).search()
   let search = await apiFeature.query
   
    res.status(200).json(search);
});
