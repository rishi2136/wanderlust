const Listing = require("../modals/listing");
const Review = require("../modals/review");

module.exports.createReview = async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;   // save the author of review
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Review Added"); //popup notification
    res.redirect(`/listing/${listing._id}`);
    }

module.exports.destroyReview = async (req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted"); //popup notification
    res.redirect(`/listing/${id}`);
    }