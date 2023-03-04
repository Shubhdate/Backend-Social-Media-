const express = require("express")
const { register, login, followUser, loggedOut, updatePassword, updateProfile, deleteUser, myProfile, getUserProfile, getAllUserProfile, forgotPassword, resetPassword } = require("../Controllers/User")
const { isAuthenticated } = require("../Middleware/Auth")

const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/follow/:id").get(isAuthenticated, followUser)
router.route("/logout").get(isAuthenticated, loggedOut)
router.route("/update/password").put(isAuthenticated, updatePassword)
router.route("/update/profile").put(isAuthenticated, updateProfile)
router.route("/delete/me").delete(isAuthenticated, deleteUser)
router.route("/me").get(isAuthenticated, myProfile)
router.route("/user/:id").get(isAuthenticated, getUserProfile)
router.route("/users").get(isAuthenticated, getAllUserProfile)
router.route("/forgot/password").post(isAuthenticated, forgotPassword)
router.route("/password/reset/:token").put(isAuthenticated, resetPassword)

module.exports = router