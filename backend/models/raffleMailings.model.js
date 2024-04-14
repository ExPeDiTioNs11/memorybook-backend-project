const mongoose = require('mongoose');


// DB model for çekilişe katılan kullanıcılar
const raffle_schema = mongoose.Schema({

    //hotel _id
    hotelid: {
        type: String,
        required: true
    },

    //mail adresleri
    mailadress: {
        type: String,
        required: true
    },

    // tam ad ve soyadları
    fullname: {
        type: String,
        required: true
    },

    // katılım sayısı
    due:{
        type: Number,
        required: false,
        default: 1
    }
    
},
    { timestamps: true }
);

module.exports = mongoose.model('RaffleMailing', raffle_schema)
