const mongoose = require('mongoose');


// DB model for çekilişe katılan kullanıcılar
const raffleWinners_schema = mongoose.Schema({

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

    // çekiliş kodu
    uniqueCode:{
        type: String,
        required: true
    }
    
},
    { timestamps: true }
);

module.exports = mongoose.model('raffleWinner', raffleWinners_schema)
