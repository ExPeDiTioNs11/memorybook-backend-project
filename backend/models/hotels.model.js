const { type } = require('express/lib/response');
const mongoose = require('mongoose');


// DB model for hotel users
const hotel_schema = mongoose.Schema({

    //hotel name
    hotelName: {
        type: String,
        required: true
    },

    // hotelin mail adresi
    hotelMailAdress: {
        type: String,
        required: true
    },

    // hotel de yetkili kişinin tam adı ve soyadı
    hotelManagerFullname: {
        type: String,
        required: true
    },

    // otel yetkilisinin veya otelin telefon numarası
    hotelManagerPhone: {
        type: String,
        required: true
    },

    // aktif veya pasif durumu
    status: {
        type: Boolean,
        required: false,
        default: false
    },

    // otelin tripadvisor linki
    tripadvisorLink: {
        type: String,
        required: false
    },

    // otelin google linki
    googleLink: {
        type: String,
        required: false
    },

    // otelin holidaycheck linki
    holidaycheckLink: {
        type: String,
        required: false
    },

    // çekilişte hediye edilecek tatil tarihi
    giftDate:{
        type: String,
        required: true,
    },

    // hotel login password
    password: {
        type: String,
        required: true
    },

    // hotel ortalama puan
    avgPoint: {
       type: Number,
       required: false
    },

    // hotele yapılan pozitif yorumlar
    possitiveComments:{
        type: Array,
        required: false
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Hotel', hotel_schema)
