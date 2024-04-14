const req = require("express/lib/request");
const res = require("express/lib/response");
const bcrypt = require('bcryptjs')
const asynchandler = require('express-async-handler');
const _hotels = require('../models/hotels.model')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');

const create_token = (id => {

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })

})

// hotel register
const hotel_register = asynchandler(async (req, res) => {

    var { hotelName, hotelMailAdress, hotelManagerFullname, hotelManagerPhone, giftDate, password } = req.body;

    try {
        if (!hotelName || !hotelMailAdress || !hotelManagerFullname || !hotelManagerPhone || !giftDate || !password) {
            res.status(200).json({
                status: 200,
                success: false,
                message: "Eksik bilgi girişi yapıldı. Lütfen tüm alanları kontrol edin."
            })
        }
        else {

            const hotel_phoneNumber = await _hotels.findOne({ hotelManagerPhone });
            const hotel_emailAdress = await _hotels.findOne({ hotelMailAdress });

            if (hotel_phoneNumber || hotel_emailAdress) {
                res.status(200).json({
                    status: 200,
                    success: true,
                    message: "Aynı telefon numarası veya E-Posta adresi ile zaten kayıtlı bir tesis mevcut."
                })
            }
            else {
                const salt = await bcrypt.genSalt(10);
                const secretPassword = await bcrypt.hash(password, salt);

                const new_hotel = _hotels.create({
                    hotelName, // hotel name
                    hotelMailAdress, // hotel mail adres
                    hotelManagerFullname, // hotel manager fullname
                    hotelManagerPhone, // hotel manager phone
                    giftDate, // hotel gift date
                    password: secretPassword // user password
                })

                if (new_hotel) {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'ebo.memorybook@gmail.com',
                            pass: 'okdf gtke fvtf sbih' // Bu kısmı kendi mail şifrenizle doldurun
                        }
                    });

                    const mailOptions = {
                        from: 'ebo.memorybook@gmail.com',
                        to: hotelMailAdress,
                        subject: 'Memorybook kaydınız gerçekleştirilmiştir,',
                        text: `Giriş bilgileriniz : 
                        e-mail : ${hotelMailAdress},
                        şifre : ${req.body.password}
                        `
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                           console.log("mail gonderılırken hata olustu : " + error)
                        } else {
                            // Mail başarıyla gönderildiğinde burası çalışır
                            // Burada başka işlemler yapılabilir
                            // En sonunda bir kez response gönderilmelidir
                          console.log("hotele mail basarıyla gonderıldı")
                        }
                    });

                    res.status(201).json({
                        status: 201,
                        success: true,
                        message: "Hotel kayıt işlemi başarılı."
                    })
                }
                else {
                    res.status(400).json({
                        status: 400,
                        success: false,
                        message: "Hatalı istek!"
                    })
                }
            }
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması : " + error
        })
    }


})

// hotel login
const hotel_login = asynchandler(async (req, res) => {
    const { hotelMailAdress, password } = req.body; // "Remember Me" durumunu alın

    try {
        if (!hotelMailAdress || !password) {
            return res.status(400).json({
                status: 200,
                success: false,
                message: "Mail veya Şifre bilgileri eksiksiz girilmelidir."
            })
        }

        const hotel = await _hotels.findOne({ hotelMailAdress }).lean();
        const token = create_token(hotel.id)

        hotel.token = token

        if (hotel && (await bcrypt.compare(password, hotel.password))) {

            return res.status(200).json({
                status: 200,
                success: true,
                hotel
            })
        } else {
            return res.status(200).json({
                status: 200,
                success: false,
                message: "E-Posta veya şifreniz yanlış. Lütfen bilgilerinizi kontrol ediniz."
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması : " + error
        })
    }
})

// get all hotels
const get_hotels = asynchandler(async (req, res) => {
    const hotels = await _hotels.find();
    try {
        if (!hotels) {
            res.status(200).json({
                status: 200,
                success: true,
                message: "Hiç kayıtlı bir hotel yok."
            })
        }
        else {
            res.status(200).json({
                status: 200,
                success: true,
                title: "Kayıtlı tüm hoteller listelenmektedir.",
                hotels
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

// get by email
const getByEmail = asynchandler(async (req, res) => {

    const hotel = await _hotels.findOne({ hotelMailAdress: { $in: req.params.hotelMailAdress } })
    try {
        if (!hotel) {
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
                hotel
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması : " + error
        })
    }

})

// get by id
const getById = asynchandler(async (req, res) => {

    const hotel = await _hotels.findById(req.params.id)
    try {
        if (!hotel) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Hatalı istek!"
            })
        }
        else {
            res.status(200).json({
                status: 200,
                success: true,
                hotel
            })
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: "Sunucu kaynaklı bir hata meydana geldi. Hata açıklaması : " + error
        })
    }

})

// hard delete hotel
const deleteHotel = asynchandler(async (req, res) => {

    const hotel = await _hotels.findById(req.params.id);

    try {
        if (!hotel) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Hatalı istek!"
            })
        }
        else {
            const hotel = await _hotels.findByIdAndDelete(req.params.id);
            res.status(200).json({
                status: 200,
                success: true,
                message: hotel.hotelName + " isimli hotel kalıcı olarak silindi."
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

// update hotel password
const update_password = asynchandler(async (req, res) => {
    const hotel = await _hotels.findById(req.params.id)
    if (!hotel) {
        res.status(400).json({
            status: 400,
            success: false,
            message: "Hatalı istek!"
        })
    }
    else {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)
        const updated_pasword = await _hotels.findByIdAndUpdate(req.params.id, { password: hash }, { new: true })
        res.status(200).json({
            status: 200,
            success: true,
            message: "Şifreniz başarıyla güncellendi."
        })
    }
})

// forgot password
const forgot_password = asynchandler(async (req, res) => {
    const { hotelMailAdress } = req.body;

    // Kullanıcıyı veritabanında bul
    const hotel = await _hotels.findOne({ hotelMailAdress: { $in: req.body.hotelMailAdress } });

    if (!hotel) {
        return res.status(400).json({ message: 'hotel bulunamadı' });
    }

    // Yeni bir şifre oluştur ve bu şifreyi hash'le
    const newPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Yeni şifreyi kullanıcıya gönder
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ebo.memorybook@gmail.com',
            pass: 'okdf gtke fvtf sbih' // Bu kısmı kendi mail şifrenizle doldurun
        }
    });

    const mailOptions = {
        from: 'ebo.memorybook@gmail.com',
        to: hotelMailAdress,
        subject: 'Şifre sıfırlama isteği - EBO memorybook',
        text: `Şifreniz sıfırlandı. Yeni şifreniz ile giriş yapabilirsiniz: ${newPassword}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(500).json({ message: 'Mail gönderirken hata oluştu', Hata: error });
        } else {
            return res.status(200).json({ message: 'Yeni şifre gönderildi', success: true });
        }
    });

    // Yeni şifreyi veritabanında güncelle
    hotel.password = hashedPassword;
    await hotel.save();

})

// update hotel
const update_hotel = asynchandler(async (req, res) => {

    const hotelControl = await _hotels.findById(req.params.id)
    if (!hotelControl) {
        res.status(400).json({
            status: 400,
            success: false,
            message: "Hatali istek"
        });
    }
    else{
        var bodyData = req.body;

        if (!bodyData) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Hatali istek"
            })
        }
        else {
            const hotel = await _hotels.findByIdAndUpdate(req.params.id, bodyData, { new: true })
            res.status(200).json({
                status: 200,
                success: true,
                hotel
            });
        }
    }
   




})

// tripadvisordan hotel detaylarını alma avg, ratings vb
const tripadvisorLocationDetails = async (req, res) => {
    try {
        // Tripadvisor API'nin endpoint'i
        const apiUrl = 'https://api.content.tripadvisor.com/api/v1/location/25418912/details';

        // API'ye gönderilecek isteğin parametreleri
        const params = {
            key: '56150AA890A5429585E2D9DA8FC68980',
            language: 'tr',
            currency: 'USD'
        };

        // Tripadvisor API'ye istek gönderme
        const response = await axios.get(apiUrl, { params });

        // Tripadvisor'dan gelen yanıtı response olarak gönderme
        res.json(response.data);
    } catch (error) {
        // Hata durumunda uygun yanıtı gönderme
        console.error('Tripadvisor API hatası:', error);
        res.status(500).json({ error: 'Tripadvisor API ile ilgili bir hata oluştu' });
    }
};


module.exports =
{
    hotel_register, // hotel register
    hotel_login, // hotel login
    get_hotels, // hotel all users
    getByEmail, // hotel user by email
    getById, // hotel user by id
    deleteHotel, // hotel hard delete
    update_password, // hotel update password byCrypto
    update_hotel, // hotel update
    forgot_password, // şifremi unuttum işlemi
    //--------------------------------------------------
    tripadvisorLocationDetails // tripadvisor location details 
}
