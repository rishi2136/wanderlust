if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
// for templating like includes
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./modals/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected with root");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,//in second
});

store.on("error", ()=>{
    console.log("Error in Mongo Session store", err);
    });

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
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
    res.locals.success = req.flash("success"); // used in lising.js in route folder
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;  // can't able to access req.user directly inejs template
    next();
});

app.use("/listing", listingRouter);
app.use("/listing/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/demouser", async (req, res) => {
    let user1 = new User({
        email: "student@gmail.com",
        username: "delta-student",
    });

    let loginuser = await User.register(user1, "helloworld");
    res.send(loginuser);
});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});

app.listen(8080, () => {
    console.log("app is listening at port 8080");
});