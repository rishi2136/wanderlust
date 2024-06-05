const Listing = require("./modals/listing.js");
const Review = require("./modals/review.js")
const { listingSchema, reviewSchema} =require("./schema.js");
const ExpressError =require("./utils/ExpressError.js");


module.exports.isLoggedIn = (req, res, next)=> {
    //req.session.passport.user !== undefined is work of isAuthenticated()
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    } 
    next();
};
//to save redirect route url
module.exports.saveRedirect = (req, res, next)=>{
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
//chech for the owner for listing 
module.exports.isOwner =  async (req, res, next)=>{
let { id } = req.params;
let listing = await Listing.findById(id);
if(!listing.owner._id.equals(res.locals.currUser._id)) {
req.flash("error","you are not the owner of this listing");
 return res.redirect(`/listing/${id}`);
}
next();
}

// define middleware for joi error
// validate the validation of joi schema for listing
module.exports.validateListing = (req, res, next)=>{
    let { error } = listingSchema.validate(req.body);  // error handling by joi npm package
    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(",");  // extracting error msg from error object
        throw new ExpressError(404,errMsg);
    } else {
        next();
    }
};

// define a middleware to handle server side err with the help of Joi
module.exports.validateReview = (req, res, next)=>{
    let { error } = reviewSchema.validate(req.body);  // error handling by joi npm package
    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(",");  // extracting error msg from error object
        throw new ExpressError(404,errMsg);
    } else {
        next();
    }
};
//check author of review
module.exports.isReviewAuthor =  async (req, res, next)=>{
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    //check id store review.author == res.locals.currUser._id
    if(!review.author.equals(res.locals.currUser._id)) {
    req.flash("error","you are not the author of the review");
     return res.redirect(`/listing/${id}`);
    }
    next();
    }