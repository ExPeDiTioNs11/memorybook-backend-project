const mongoose = require('mongoose');


// DB model for admin users
const admin_schema = mongoose.Schema({

    // admin tam ad ve soyad
    fullname: {
        type: String,
        required: true
    },

    // admin mail adres
    mailadress: {
        type: String,
        required: true
    },

    // admin telefon numarası
    phonenumber: {
        type: String,
        required: true
    },

    // admin şifre
    password: {
        type: String,
        required: true
    }
 
    
},
    { timestamps: true }
);

module.exports = mongoose.model('Admin', admin_schema)
