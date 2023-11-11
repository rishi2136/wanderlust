const express = require("express");
const router = express.Router();
const wrapAsync =require("../utils/wrapAsync.js");
const ExpressError =require("../utils/ExpressError.js");
const Listing = require("../modals/listing.js");
const { listingSchema} =require("../schema.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(
wrapAsync(listingController.index)
)
.post(
isLoggedIn, 
upload.single("listing[image]"),  // to save file data image using multer
validateListing,
 wrapAsync(listingController.createListing)
)

router.route("/find")
.get(
wrapAsync(listingController.searchListing));

router.get("/new",
isLoggedIn, 
listingController.renderNewForm) 

router.route("/:id")
.get(
wrapAsync(listingController.showListing)
)
.put(
isLoggedIn, 
isOwner,
upload.single("listing[image]"),  // to save file data image using multer
validateListing,
 wrapAsync(listingController.updateListing)
)
.delete(
isLoggedIn,
isOwner,
 wrapAsync(listingController.destroyListing)
)

router.get("/:id/edit",
isLoggedIn,
isOwner,
 wrapAsync(listingController.renderEditForm)
);


module.exports = router;