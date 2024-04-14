const jwt = require('jsonwebtoken')
const _admin = require('../models/admin.model')
const asyncHandler = require('express-async-handler')
const req = require('express/lib/request')
const res = require('express/lib/response')

const userControl = asyncHandler( async (req, res, next) => {

    let encryptedToken; // şifrelenmiş token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        try{
            encryptedToken = req.headers.authorization.split(' ')[1];
            const token = jwt.verify(encryptedToken, process.env.JWT_SECRET);
            req.user = await _admin.findById(token.id).select('-password');
            next()
        }
        catch(error) {
            res.status(400)
            throw new Error('Token işlenirken bir hata oluştu.')
        }
    }
   
    if(!encryptedToken)
    {
        res.status(400)
        throw new Error('Erişim için yetkiniz yok.')
    }
}) 


module.exports = {
    userControl
}