const req = require("express/lib/request");
const res = require("express/lib/response");
const bcrypt = require('bcryptjs')
const asynchandler = require('express-async-handler');
const _admin = require('../models/admin.model')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const create_token = (id => {

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })

})

// admin register
const admin_register = asynchandler(async (req, res) => {

    var { fullname, mailadress, phonenumber, password } = req.body;

    try {
        if (!fullname || !mailadress || !phonenumber || !password) {
            res.status(200).json({
                status: 200,
                success: false,
                message: "Eksik bilgi girişi yapıldı. Tüm alanların eksiksiz doldurulması gerekmektedir."
            })
        }
        else {

            const admin_phoneNumber = await _admin.findOne({ phonenumber });
            const admin_emailAdress = await _admin.findOne({ mailadress });

            if (admin_phoneNumber || admin_emailAdress) {
                res.status(200).json({
                    status: 200,
                    success: true,
                    message: "Aynı telefon numarası veya E-Posta adresi ile zaten kayıtlı bir kullanıcı mevcut. Şifremi unuttum bölümünden destek alabilirsiniz."
                })
            }
            else {
                const salt = await bcrypt.genSalt(10);
                const secretPassword = await bcrypt.hash(password, salt);

                const new_admin = _admin.create({
                    fullname, // user first name
                    mailadress, // user surname
                    phonenumber, // user email adres
                    password: secretPassword // user password
                })

                if (new_admin) {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'ebo.memorybook@gmail.com',
                            pass: 'okdf gtke fvtf sbih' // Bu kısmı kendi mail şifrenizle doldurun
                        }
                    });

                    const mailOptions = {
                        from: 'ebo.memorybook@gmail.com',
                        to: mailadress,
                        subject: 'EBO sistemlerine hoşgeldiniz,',
                        text: `Giriş bilgileriniz : 
                        e-mail: ${req.body.mailadress},
                        password: ${req.body.password}
                        `
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return res.status(500).json({ message: 'Mail gönderirken hata oluştu', Hata: error });
                        } else {
                            return res.status(200).json({ message: 'Yeni şifre gönderildi' });
                        }
                    });

                    res.status(201).json({
                        status: 201,
                        success: true,
                        message: "Kullanıcı kayıt işlemi başarılı."
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

// admin login
const admin_login = asynchandler(async (req, res) => {
    const { mailadress, password } = req.body; // "Remember Me" durumunu alın

    try {
        if (!mailadress || !password) {
            return res.status(400).json({
                status: 200,
                success: false,
                message: "Mail veya Şifre bilgileri eksiksiz girilmelidir."
            })
        }

        const admin = await _admin.findOne({ mailadress }).lean();
        const token = create_token(admin.id)

        admin.token = token

        if (admin && (await bcrypt.compare(password, admin.password))) {

            return res.status(200).json({
                status: 200,
                success: true,
                admin
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

// get all admins
const get_admins = asynchandler(async (req, res) => {
    const admins = await _admin.find();
    try {
        if (!admins) {
            res.status(200).json({
                status: 200,
                success: true,
                message: "Hiç kayıtlı bir admin yok."
            })
        }
        else {
            res.status(200).json({
                status: 200,
                success: true,
                title: "Kayıtlı tüm adminler listelenmektedir",
                admins
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

    const admin = await _admin.findOne({ mailadress: { $in: req.params.mailadress } })
    try {
        if (!admin) {
            res.status(200).json({
                status: 200,
                success: true,
                message: "Bu email adresinde bir kullanıcı bulunamadı."
            })
        }
        else {
            res.status(200).json({
                status: 200,
                success: true,
                admin
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

    const admin = await _admin.findById(req.params.id)
    try {
        if (!admin) {
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
                admin
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

// hard delete admin
const deleteAdmin = asynchandler(async (req, res) => {

    const admin = await _admin.findById(req.params.id);

    try {
        if (!admin) {
            res.status(400).json({
                status: 400,
                success: false,
                message: "Hatalı istek!"
            })
        }
        else {
            const admin = await _admin.findByIdAndDelete(req.params.id);
            res.status(200).json({
                status: 200,
                success: true,
                message: admin.fullname + " isimli admin kullanıcısı kalıcı olarak silindi."
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

// update admin password
const update_password = asynchandler(async (req, res) => {
    const admin = await _admin.findById(req.params.id)
    if (!admin) {
        res.status(400).json({
            status: 400,
            success: false,
            message: "Hatalı istek!"
        })
    }
    else {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)
        const updated_pasword = await _admin.findByIdAndUpdate(req.params.id, { password: hash }, { new: true })
        res.status(200).json({
            status: 200,
            success: true,
            message: "Şifreniz başarıyla güncellendi."
        })
    }
})

// forgot password
const forgot_password = asynchandler(async (req, res) => {
    const { email } = req.body;

    // Kullanıcıyı veritabanında bul
    const admin = await _admin.findOne({ mailadress: { $in: req.body.email } });

    if (!admin) {
        return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
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
        to: email,
        subject: 'Şifre sıfırlama isteği - EBO memorybook',
        text: `Şifreniz sıfırlandı. Yeni şifreniz ile giriş yapabilirsiniz: ${newPassword}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(500).json({ message: 'Mail gönderirken hata oluştu', Hata: error });
        } else {
            return res.status(200).json({ message: 'Yeni şifre gönderildi' });
        }
    });

    // Yeni şifreyi veritabanında güncelle
    admin.password = hashedPassword;
    await admin.save();

})

// update admin
const update_admin = asynchandler(async (req, res) => {

    const userControl = await _admin.findById(req.params.id)
    var bodyData = req.body;

    if (!bodyData) {
        res.status(400).json({
            status: 400,
            success: false,
            message: "Hatali istek"
        })
    }
    else {
        const admin = await _admin.findByIdAndUpdate(req.params.id, bodyData, { new: true })
        res.status(200).json({
            status: 200,
            success: true,
            admin
        });
    }




})


module.exports =
{
    admin_register, // admin register
    admin_login, // admin login
    get_admins, // admin all users
    getByEmail, // admin user by email
    getById, // admin user by id
    deleteAdmin, // admin hard delete
    update_password, // admin update password byCrypto
    update_admin, // admin update
    forgot_password // şifremi unuttum işlemi
}
