const Joi = require('joi');
//modules created to manage the server side validation such as req through postman or hoppscotch
module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("",null),
        category: Joi.string().required().valid("rooms","iconicCities", "mountains", "castles", "amazingPools", "camping", "farms", "arctic", "domes", "boats"),
    }).required(),
    });

    module.exports.reviewSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            comment: Joi.string().required()
        }).required(),
    });
