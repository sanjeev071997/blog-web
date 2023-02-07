import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please Enter Title"],
        unique: true,
    },
    desc: {
        type: String,
        required: [true, "Please Enter Description"],
    },

    image: {
        type: String,
        required: false
    },

    username: {
        type: String,
        required: true,
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required:true,
    },
},
    { timestamps: true }
);

const post = mongoose.model("Post", PostSchema);
export default post;