const req = require("express/lib/request");
const res = require("express/lib/response");
const bcrypt = require('bcryptjs')
const asynchandler = require('express-async-handler');
const _raffle = require('../models/raffleMailings.model');
const _raffleWinners = require('../models/raffle_winners.model');
const _hotels = require('../models/hotels.model');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Nodemailer transporter oluştur
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ebo.memorybook@gmail.com', // E-posta adresiniz
        pass: 'okdf gtke fvtf sbih' // E-posta şifreniz
    }
});

// yeni mail kaydet - kazanma şansları ile birlikte kaydet
const createNewMail = asynchandler(async (req, res) => {
    const { hotelid, mailadress, fullname, due } = req.body;

    try {
        if (!mailadress || !hotelid || !fullname) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Lütfen çekilişe katılmak ve yorumunuzu belirtebilmek için bilgilerinizi eksiksiz giriniz."
            });
        }

        const randomCode = generateRandomCode(); // Rastgele kod oluştur

        const new_mail = await _raffle.create({
            hotelid,
            mailadress,
            fullname,
            randomCode,
            due
        });

        if (new_mail) {
            
            const hotel = await _hotels.findById(req.body.hotelid);

            const mailContent = `
            Hello ${req.body.fullname},

            Greetings from MemoryBook!

            Your entry into our hotel review promotion was successful. Your valuable review for the hotel has been received through our app, and we're excited to share the details.

            Your Entry Details:
            Hotel : ${hotel.hotelName}
            Your Unique Code: ${randomCode}

            How Does the Entry Work?
            By submitting your review through our app, you've earned a ticket for the chance to win a "2 People Holiday for a Week" at the end of the season. The more reviews you make, the higher your chances of winning this exciting prize!

            Prize Pool Selection Period:
            The prize pool selection period occurs at the end of each season. At this time, a random code will be selected, and the lucky participant associated with that code will be announced as the winner of the holiday getaway.

            We want to thank you for your contribution to improving hotel experiences through your thoughtful reviews.

            Should you have any questions or encounter any issues, please don't hesitate to reach out to us. Our dedicated support team is here to assist you.

            Thank you for choosing MemoryBook for your hotel review experiences. Best of luck in the prize draw, and we look forward to providing you with more exciting opportunities in the future!

            MemoryBook Team`;

            // E-posta gönder
            await transporter.sendMail({
                from: 'ebo.memorybook@gmail.com', // Gönderici e-posta adresi
                to: winner.mailadress, // Kazananın e-posta adresi
                subject: 'MemoryBook - Hotel Review Promotion', // E-posta konusu
                text: mailContent // Metin tabanlı e-posta içeriği
            });

            return res.status(201).json({
                status: 201,
                success: true,
                message: "Mail adresiniz başarıyla çekiliş kampanyasına eklenmiştir.",
                new_mail
            });
        } else {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Hatalı istek!"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması : " + error
        });
    }
});

// çekilişe katılma şansı yakalayan tüm mail adreslerini listele
const get_raffleMailings = asynchandler(async (req, res) => {
    const raffleMailings = await _raffle.find();
    try {
        if (!raffleMailings) {
            res.status(200).json({
                status: 200,
                success: true,
                message: "Çekilişe katılmaya hak kazanmış hiç bir mail adresi bulunmuyor."
            })
        }
        else {
            res.status(200).json({
                status: 200,
                success: true,
                title: "Kayıtlı tüm mail adresleri listelenmektedir.",
                raffleMailings
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması : " + error
        })
    }


})

// hotele kaydolmus çekiliş mailleri
const getByHotelId = asynchandler(async (req, res) => {

    const HotelRaffleMailings = await _raffle.find({ hotelid: { $in: req.params.hotelid } })
    try {
        if (!HotelRaffleMailings) {
            res.status(200).json({
                status: 200,
                success: true,
                message: "Bu email adresinde bir hotel bulunamadı."
            })
        }
        else {
            res.status(200).json({
                status: 200,
                success: true,
                HotelRaffleMailings
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması : " + error
        })
    }

})

// update raffleMailings
const update_raffleMailings = asynchandler(async (req, res) => {

    const raffleMailingsControl = await _raffle.findById(req.params.id)
    if (!raffleMailingsControl) {
        res.status(400).json({
            status: 400,
            success: false,
            message: "Hatali istek"
        });
    }
    else {
        var bodyData = req.body;

        if (!bodyData) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Hatalı istek"
            })
        }
        else {
            const raffleMailings = await _raffle.findByIdAndUpdate(req.params.id, bodyData, { new: true })
            res.status(200).json({
                status: 200,
                success: true,
                raffleMailings
            });
        }
    }





})

// yorum yapmaya devam edildikçe çekilişteki şansı arttırılıyor
const plusRaffle = asynchandler(async (req, res) => {
    const raffleMailingsControl = await _raffle.findById(req.params.id);

    if (!raffleMailingsControl) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Hatalı istek"
        });
    }

    // Mevcut due değerini al
    const currentDue = raffleMailingsControl.due;

    // Yeni due değerini oluştur
    const newDue = currentDue + 1;

    // Güncelleme işlemi
    const raffleMailings = await _raffle.findByIdAndUpdate(req.params.id, { due: newDue }, { new: true });

    res.status(200).json({
        status: 200,
        success: true,
        raffleMailings
    });
});



const raffle = asynchandler(async (req, res) => {
    try {
        // Tüm raffleMailings verilerini al
        const raffleMailings = await _raffle.find();

        // Eğer hiç mail adresi bulunamazsa
        if (raffleMailings.length === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Çekilişe katılmaya hak kazanmış hiçbir mail adresi bulunmuyor."
            });
        }

        // Şans oranlarını hesaplamak için due değerlerini topla
        const totalDue = raffleMailings.reduce((acc, curr) => acc + curr.due, 0);

        // Rastgele bir sayı oluştur ve kazananı belirle
        const random = Math.floor(Math.random() * totalDue);
        let winner;
        let cumulativeDue = 0;
        for (const mail of raffleMailings) {
            cumulativeDue += mail.due;
            if (random < cumulativeDue) {
                winner = mail;
                break;
            }
        }

        const hotel = await _hotels.findById(winner.hotelid);

        // Kazanan mail adresine gönderilecek e-posta içeriği
        
        const mailContent = `
            Hello ${winner.fullname},

            You won your draw in ${winner.randomCode} draws. Please contact hotel ${hotel.hotelName} for information.`;

        // E-posta gönder
        await transporter.sendMail({
            from: 'ebo.memorybook@gmail.com', // Gönderici e-posta adresi
            to: winner.mailadress, // Kazananın e-posta adresi
            subject: 'MemoryBook - Hotel Review Promotion', // E-posta konusu
            text: mailContent // Metin tabanlı e-posta içeriği
        });

        // Kazananın bilgilerini _raffleWinners modeline kaydet
        const winnerData = new _raffleWinners({
            fullname: winner.fullname,
            mailadress: winner.mailadress,
            uniqueCode: randomCode
        });
        await winnerData.save();

        res.status(200).json({
            status: 200,
            success: true,
            title: "Kazanan mail adresi belirlendi, e-posta gönderildi ve kazanan veritabanına kaydedildi.",
            winner,
            randomCode // Sadece geliştirme amaçlı, gerçekte bu kodu kullanıcıya göndermeden önce saklamalısınız
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması: " + error
        });
    }
});

const get_winner_mailings = asynchandler(async (req, res) => {
    const winners = await _raffleWinners.find();
    try {
        if (!winners) {
            res.status(200).json({
                status: 200,
                success: true,
                message: "Çekilişe katılmaya hak kazanmış hiç bir mail adresi bulunmuyor."
            })
        }
        else {
            res.status(200).json({
                status: 200,
                success: true,
                title: "Kayıtlı tüm mail adresleri listelenmektedir.",
                winners
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması : " + error
        })
    }


})

// 6 haneli rastgele büyük harf ve rakam içeren kod oluştur
function generateRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 6; i++) {
        randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomCode;
}


module.exports =
{
    createNewMail, // çekiliş için mail adresi kaydet
    get_raffleMailings, // çekiliş hakkı kazanmış mail adreslerini listele
    update_raffleMailings, // güncelleme
    plusRaffle, // çekiliş hakkı kazanan kişi yorum ypamaya devam ettikçe şansını arttır
    raffle, // çekilişi gerçekleştir ve kazanan kullanıcıya mail adresi gönder 
    getByHotelId, // otele kaydolmus çekiliş maillerini listele
    get_winner_mailings // get all winners mails
}