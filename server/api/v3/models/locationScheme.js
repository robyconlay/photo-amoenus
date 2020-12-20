//schema model for location table

const mongoose = require('mongoose');


const locationSchema = mongoose.Schema({  
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
    raggiungibilita: [{type: String, required: true}],
    locationImage: {type: mongoose.Schema.Types.ObjectId, ref: 'Image' , required: true},      //array of IDs, with every id identifying an image
    photoDesc: {type: String, required: true},
    hour: {type: String, required: true},
    date: {type: String, required: true},   
    likes: Number
});

/**
 * Ricerca con FILTRI
 */
//Se category è null ritorna tutti gli elementi, altrimenti applica il filtro
locationSchema.query.byCategory = function(category){
    if(!category){
        return this;
    } else {
        var cat = category.toLowerCase();
        return this.where({"category": cat});
    }
};
locationSchema.query.byCity = function(city){
    if(!city){
        return this;
    } else {
        var citta = city.toLowerCase();
        return this.where({"city": citta});
    }
};
locationSchema.query.byRagg = function(raggiungibilita){
    if(!raggiungibilita){
        return this;
    } else {
        var ragg = raggiungibilita.toLowerCase();
        console.log(ragg);
        return this.where({"raggiungibilita": {$in: ragg} });
    }
};


module.exports = mongoose.model('Location', locationSchema);