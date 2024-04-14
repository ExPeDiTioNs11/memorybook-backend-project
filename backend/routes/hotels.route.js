const express = require('express');
const { hotel_register,
    hotel_login,
    get_hotels,
    getByEmail,
    getById,
    deleteHotel,
    update_hotel,
    update_password, 
    forgot_password,
    tripadvisorLocationDetails
} = require('../controllers/hotels.controller');
const { userControl } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/hotel-register', hotel_register); // hotel kayıt olma / etme
router.post('/hotel-login', hotel_login); // hotel giriş
router.get('/', userControl, get_hotels); // tüm hotel listele
router.route('/get-by-email/:hotelMailAdress').get(userControl, getByEmail); // email ile hotel getir
router.route('/get-by-id/:id').get(userControl, getById); // id değeri ile hotel getir
router.route('/hotel-update/:id').put(userControl, update_hotel); // hotel güncelle
router.route('/delete-hotel/:id').delete(userControl, deleteHotel) // hotel kalıcı olarak silme
router.put('/update-password/:id', userControl, update_password);  // hotel şifresini şifreli olarak güncelleme
router.put('/forgot-password', forgot_password);  // hotel şifresini şifreli olarak güncelleme
router.get('/tripadvisor-location-details', userControl, tripadvisorLocationDetails) // tripadvisor hotel detaylarını getirme

module.exports = router

