import catchAsyncErrors from "../../middleware/catchAsyncErrors.js";
import Comment from "../../models/comments/commentsModels.js";

// create new comment 
export const createComment = catchAsyncErrors(async (req, res, next) => {
    const { username, postId, comments, senderProfile } = req.body

    const newComments = await Comment.create({
        username,
        postId,
        comments, 
        senderId: req.user,      // user ,
    });
    res.status(201).json({
        success: true,
        newComments,
        message: "Your comment successfully send"
    });
});

// Get all Comment
export const getAllComments = catchAsyncErrors(async (req, res, next) => {
    const comment = await Comment.find({ postId: req.params.id }).populate({path:'senderId',select:['username', 'profile']});;
    res.status(200).json({
        success: true,
        comment,
    });
});

// delete comment
export const deleteComment = catchAsyncErrors(async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        await comment.delete();
        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        })
    } catch (error) {
        res.status(500).json(error);
    }
});
