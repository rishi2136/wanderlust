const mongoose =require("mongoose");
const Schema = mongoose.Schema;
const Review =require("./review.js");

const listingSchema =new Schema( {
    title: {
        type: String,
        required: true,
      },
      description: String,
      image: {
        url: String,
        filename: String
      },
      price: {
        type: Number,
        required: true,
      },
      location: String,
      country: String,
      reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review", 
      }],
      owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],  //array of longitude and latitude
          required: true
        }
      },
      category: {
        type: String,
        enum: ["rooms","iconicCities", "mountains", "castles", "amazingPools", "camping", "farms", "arctic", "domes", "boats"],
        required: true
      }
    });

    //auto trigger whenever findByIdAndDelete Triggered
    //deletion mongoose middleware to manage review deletion whenever related listing deleted
    listingSchema.post("findOneAndDelete", async(listing)=>{
      if(listing)
      await Review.deleteMany({_id: {$in :listing.reviews}})
    });

    const Listing = mongoose.model("Listing", listingSchema);
    module.exports = Listing;