const Listing = require("../modals/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.createListing = async (req, res, next) => {
    console.log(req.body.listing.category);
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send()

    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!"); //popup notification
    res.redirect("/listing");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    // nesting populate to see access author of listing
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author", } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not Existing");
        return res.redirect("/listing");
    }
    res.render("listings/show.ejs", { listing });
}


module.exports.searchListing = async (req, res) => {
    let { inputVal: val = "Rooms" } = req.query;
    if (!val) {
        req.flash("error","Such category of listing not found");
        res.redirect("/listing");
    } else {
        req.flash("success","List your searching");
        let allListings = await Listing.find({category: `${val}`})
        res.render("listings/index.ejs", { allListings });
        console.log(val);
    } 
}


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for doesn't Existing");
        return res.redirect("/listing");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,e_blur:50");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {  // if any new file is uploaded 
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated"); //popup notification
    res.redirect("/listing");
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted"); //popup notification
    res.redirect("/listing");
}