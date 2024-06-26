const User = require("../modals/user");

module.exports.signupRenderForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password); //register the user (passport bulti-in function)
        console.log(registeredUser);
        req.login(registeredUser, (err) => {   //auto login the user when he/she signup 
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listing");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}

module.exports.loginRenderForm = (req, res) => {
    res.render("users/login.ejs");
}
//to login in website
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    //redirectUrl store store exact url from where we left for the login or signup
    const redirectUrl = res.locals.redirectUrl || "/listing";
    res.redirect(redirectUrl);
}
//logout from
module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out");
        res.redirect("/listing");
    })
}