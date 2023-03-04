const Post = require("../Models/Post")
const User = require("../Models/User")


//this is for creating an post
exports.createPost = async(req,res) => {
    try {
        const newPostData = {
            caption:req.body.caption,
            image:{
                public_id:'req.body.public_id',
                url:'req.body.url'
            },
            owner:req.user._id
        }

        // const newPost = await Post.create(newPostData)
        const post = await Post.create(newPostData)

        //this is for send id to posts 
        const user = await User.findById(req.user._id)
        // user.posts.push(newPost._id)
        user.posts.push(post._id)
        await user.save()

        res.status(201).json({
            sucess:true,
            // post:newPost
            post
        })
    } 
    catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//this is for liking and unliking the post
exports.likeandUnlikePost = async(req,res) => {
    try {
        const post = await Post.findById(req.params.id)

        if(!post){
            res.status(500).json({
                sucess:false,
                message:"Post not found"
            })
        }

        if(post.likes.includes(req.user._id)){
            const index  = post.likes.indexOf(req.user._id)
            post.likes.splice(index,1)
            await post.save()

            res.status(201).json({
                sucess:true,
                // post:newPost
                message:"Post Unlike hogyi"
            })
        }
        else{
             post.likes.push(req.user._id)
            await post.save()
            res.status(201).json({
                sucess:true,
                // post:newPost
                message:"Post like hogyi"
            })
        }

       
    } 
    catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//this is for deleting a post
exports.deletePost = async(req,res) => {
    try {
        const post = await Post.findById(req.params.id)

        if(!post){
            res.status(500).json({
                sucess:false,
                message:"Post not found"
            })
        }

        if(post.owner.toString() !== req.user._id.toString()){
            res.status(400).json({
                sucess:false,
                message:"Unauthorized"
            })
        }
        await post.remove()

        const user = await User.findById(req.user._id)
        const index = user.posts.indexOf(req.params.id)
        user.posts.slice(index,1)
        await user.save()

        res.status(200).json({
            sucess:true,
            message:"Post delete hogyi"
        })
    } 
    catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//if someone follow anyone then we have to see its posts 
exports.getPostFollowing = async(req,res) => {
    try {
        // method1
        // const user = await User.findById(req.user._id).populate("following","posts")
        // res.status(200).json({
        //     sucess:true,
        //     following:user.following
        // })

        // method2
        const user = await User.findById(req.user._id)
        user.following
        const posts = await Post.find({
            owner:{
                $in: user.following
            }
        })
        res.status(200).json({
            sucess:true,
            posts
        })
    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}


//updating Captions
exports.updateCaptions = async(req,res) => {
    try {
       
        const post = await Post.findById(req.params.id)
        if(!post){
            res.status(500).json({
                sucess:false,
                message:"Post not found"
            })
        }

        if(post.owner.toString() !== req.user._id.toString()){
            res.status(500).json({
                sucess:false,
                message:"Unauthorized"
            })
        }


        post.caption = req.body.caption
        await post.save()
        return res.status(200).json({
            sucess:true,
            message:"POST UPDATED"
        })

    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//adding comments 
exports.addUpdateComments = async(req,res) => {
    try {
       
        const post = await Post.findById(req.params.id)

        if(!post){
            res.status(500).json({
                sucess:false,
                message:"post not found"
            })
        }
        //this is for adding comment
        // post.comments.push({
        //     user:req.user._id,
        //     comment:req.body.comment
        // })


        //this is for adding and updating comment 
        let commentExists = -1
        //this is for checking if comment already exists 
        post.comments.forEach((item,index) => {
            if(item.user.toString() === req.user._id.toString()){
                commentExists = index
            }
        })

        if(commentExists !== -1){
            post.comments[commentExists].comment = req.body.comment 
            await post.save() 
            return res.status(200).json({
                success:true,
                message:"Comment updated"
            })
        }
        else{
            post.comments.push({
                user:req.user._id,
                comment:req.body.comment
            })
            await post.save()
            return res.status(200).json({
                success:true,
                message:"Comment added"
            })
        }
        

    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//deletecomment
exports.deleteComments = async(req,res) => {
    try {
        const post = await Post.findById(req.params.id)//this is for fingding post ka id

        if(!post){
            res.status(500).json({
                sucess:false,
                message:"post not found"
            })
        }


        //for owner ke comments 
        if (post.owner.toString() === req.user._id.toString()) {

            if(req.body.commentId === undefined){
                res.status(500).json({
                    sucess:false,
                    message:"commentId is wrong"
                })
            }

            post.comments.forEach((item,index) => {
                if(item._id.toString() === req.body.commentId.toString()){
                   return post.comments.splice(index,1)
                }
            })
            await post.save() 
            return res.status(200).json({
                success:true,
                message:"Selecetd Comment has Deleted"
            })
        } 
        //for followers comments 
        else {
            post.comments.forEach((item,index) => {
                if(item.user.toString() === req.user._id.toString()){
                   return post.comments.splice(index,1)
                }
            })
            await post.save() 
            return res.status(200).json({
                success:true,
                message:"Your Comment Deleted"
            })
        }

    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}