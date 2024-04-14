const req = require("express/lib/request");
const res = require("express/lib/response");


const errorCatching = (err, req, res, next) =>
{
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);
    res.json({
        message : err.message
        //desc : process.env.NODE_ENV === 'production' ? null : err.stack
    })
}

module.exports = 
{
    errorCatching
}