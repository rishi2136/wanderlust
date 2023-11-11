const express = require("express");
const router = express.Router();
const User = require("../modals/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirect } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
.get( userController.signupRenderForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get( userController.loginRenderForm)
.post(
saveRedirect, 
passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}), 
userController.login); 

router.get("/logout", userController.logout);

module.exports = router;