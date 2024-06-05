if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");  //framework for Node.js(to use it)
const app = express();
const mongoose = require("mongoose"); //connect with the database
const path = require("path");  //to set global path for file(public and views)  
const methodOverride = require("method-override");  //to override the methods post to patch, delete, or put
// for templating like includes
const ejsMate = require("ejs-mate");  //templete used for render page layout
const ExpressError = require("./utils/ExpressError.js");  //custom error class
const session = require("express-session");  // to perform operations in particular session
const MongoStore = require('connect-mongo');
const flash = require("connect-flash"); // to flash the message
const passport = require("passport");  //used for user login
const LocalStrategy = require("passport-local"); //strategy used for sign up and login (username, password)
const User = require("./modals/user.js");



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;  //url link to connect with DB
// const dbUrl = 'mongodb://127.0.0.1:27017/wanderlust';

main()
    .then(() => {
        console.log("connected with root");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);  //make connection with DB
}

app.set("view engine", "ejs");  //set default view engine
app.set("views", path.join(__dirname, "views")); //make file accessible from root directory

app.use(express.urlencoded({ extended: true }));  // parse the json data to readable format
app.use(express.static(path.join(__dirname, "public"))); //path for static files(extra js and css file)
app.use(methodOverride("_method")); //use method override append as query with url requested at 
app.engine('ejs', ejsMate); //set templete extension 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,//in second
});

store.on("error", () => {
    console.log("Error in Mongo Session store", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,  //some secre code for the session
    resave: false,
    saveUninitialized: true,
    cookie: {  //saved info on browser
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // in ms
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, //secure us from cross scripting attack
    },
};



app.use(session(sessionOptions));
app.use(flash()); //popup message

app.use(passport.initialize());  //passport initializtion
app.use(passport.session());  //work in per session
passport.use(new LocalStrategy(User.authenticate()));  // for authentication

passport.serializeUser(User.serializeUser()); // serialize user in session or store user info in session
passport.deserializeUser(User.deserializeUser());  // clear user info from session


// use cookies to store some msg on browser
app.use((req, res, next) => {
    //res.locals variable accessible in res.render page directly
    res.locals.success = req.flash("success"); // used in lising.js in route folder
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;  // can't able to access req.user directly in ejs template
    next();
});



app.use("/listing", listingRouter); // use routes for routes/listing.js
app.use("/listing/:id/reviews", reviewRouter); // use routes for routes/review.js
app.use("/", userRouter); // use routes for routes/user.js



app.all("*", (req, res, next) => {  //work for all routes
    next(new ExpressError(404, "Page Not Found"));
})

app.use((err, req, res, next) => {  //error handling mw work as last option mw
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});

app.listen(4000, () => { //route listen at 8000
    console.log("app is listening at port 4000");
});