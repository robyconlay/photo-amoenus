//schema model for location table

const mongoose = require('mongoose');


const locationSchema = mongoose.Schema({
    locId: {
        type: mongoose.ObjectId,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        lowercase: true
    },
    description: {
        type: String,
        maxLength: 300,
        required: false,
        default: ""
    },
    category: {
        type: String,
        required: true
    },
    accessibility: [{
        type: String,
        lowercase: true
    }],
    imagesIDs: [{ //locationImage
        type: mongoose.ObjectId,
        ref: 'Image',
        required: false
    }], //array of IDs, with every id identifying an image
    photoDesc: {
        type: String,
        required: false,
        default: ""
    },
    likes: {
        type: Number,
        // required: false,
        default: 0
    },
    createdByUid: {
        type: mongoose.ObjectId,
        required: true,
        immutable: true
    },
    createdAt: {
        type: Date,
        required: true,
        immutable: true
    },
    updatedAt: {
        type: Date,
        required: false,
        default: null
    }
});

/**
 * Ricerca con FILTRI
 */
//Se category è null ritorna tutti gli elementi, altrimenti applica il filtro
locationSchema.query.byCategory = function(category) {
    if (!category) {
        return this;
    } else {
        var category = category.toLowerCase();
        return this.where({ "category": category });
    }
};
locationSchema.query.byCity = function(city) {
    if (!city) {
        return this;
    } else {
        var city = city.toLowerCase();
        return this.where({ "city": city });
    }
};
locationSchema.query.byAccess = function(accessibility) {
    if (!accessibility) {
        return this;
    } else {
        var accessibility = accessibility.toLowerCase();
        return this.where({ "accessibility": { $in: accessibility } });
    }
};


module.exports = mongoose.model('Location', locationSchema);