const express = require('express');
const { createNewMail,
    get_raffleMailings,
    update_raffleMailings,
    plusRaffle,
    raffle,
    raffleRestorant,
    getByHotelId,
    get_winner_mailings
} = require('../controllers/raffle.controller');
const { userControl } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/save-new-mail', createNewMail); // yeni çekiliş hakkı kazanan mail ekle
router.get('/', userControl, get_raffleMailings); // tüm çekiliş hakkı kazanan mailleri listele
router.get('/get-winner-mailings', userControl, get_winner_mailings); // kazanan mailleri listele
router.route('/plus-raffle/:id').get(userControl, plusRaffle); // email in kazanma şansını arttır
router.route('/hotel-raffle-mailings/:hotelid').get(userControl, getByHotelId); //hotele kaydedilmiş çekiliş mailleri
router.get('/raffle', userControl, raffle); // çekiliş yap
router.get('/restorant-raffle', raffleRestorant) // restorant için çekiliş
module.exports = router

