const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//CREATE A POST

router.post("/", async (req, res) => {
    const newPost = new Post(req.body);

    try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }catch (e){
        res.status(500).json(err);
    }
});

//UPDATE A POST

router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.userId === req.body.userId) {
            await post.updateOne({$set:req.body});
            res.status(200).json("the post has been updated");
        } else {
            res.status(403).json("you can update only your posts");
        }
    }catch (e){
        res.status(500).json(e);
    }
});

//DELETE A POST
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.userId === req.body.userId) {
            await post.deleteOne({$set:req.body});
            res.status(200).json("the post has been deleted");
        } else {
            res.status(403).json("you can delete only your posts");
        }
    }catch (e){
        res.status(500).json(e);
    }
});

//LIKE/DISLIKE A POST

router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes:req.body.userId}});
            res.status(200).json("the post has been liked");
        }else{
            await post.updateOne({$pull:{likes:req.body.userId}});
            res.status(200).json("the post has been disliked");
        }
    }catch (e){
        res.status(500).json(e);
    }
});

//GET A POST

router.get("/:id", async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch (e){
        res.status(500).json(e);
    }
});

//GET TIMELINE

router.get("/timeline/all", async (req, res) => {
   try{
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followins.map((friendId)=>{
            return Post.find({userId: friendId});
        }));
        res.json(userPosts.concat(...friendPosts));
   }catch (e){
       res.status(500).json(e);
   }
});


module.exports = router;