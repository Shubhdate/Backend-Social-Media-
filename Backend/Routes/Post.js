const express = require("express")
const { createPost, likeandUnlikePost, deletePost, getPostFollowing, updateCaptions, addUpdateComments, deleteComments } = require("../Controllers/Post")
const { isAuthenticated } = require("../Middleware/Auth")

const router = express.Router()

router.route("/post/upload").post(isAuthenticated,createPost)
router.route("/post/:id").get(isAuthenticated,likeandUnlikePost)
router.route("/post/:id").delete(isAuthenticated,deletePost)
router.route("/posts").get(isAuthenticated,getPostFollowing)
router.route("/post/:id").put(isAuthenticated, updateCaptions)
router.route("/post/comment/:id").put(isAuthenticated, addUpdateComments)
router.route("/post/comment/delete/:id").delete(isAuthenticated, deleteComments)

module.exports = router