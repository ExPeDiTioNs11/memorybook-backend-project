const express = require('express');
const { admin_register,
    admin_login,
    get_admins,
    getByEmail,
    getById,
    deleteAdmin,
    update_admin,
    update_password, 
    forgot_password
} = require('../controllers/admin.controller');
const { userControl } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/register', admin_register); // admin kayıt olma / etme
router.post('/login', admin_login); // admin giriş
router.get('/', userControl, get_admins); // tüm admin listele
router.route('/get-by-email/:mailadress').get(userControl, getByEmail); // email ile admin getir
router.route('/get-by-id/:id').get(userControl, getById); // id değeri ile admin getir
router.route('/admin-update/:id').put(userControl, update_admin); // admin güncelle
router.route('/delete-admin/:id').delete(userControl, deleteAdmin) // admin kalıcı olarak silme
router.put('/update-password/:id', userControl, update_password);  // admin şifresini şifreli olarak güncelleme
router.put('/forgot-password', forgot_password);  // admin şifresini şifreli olarak güncelleme

module.exports = router

