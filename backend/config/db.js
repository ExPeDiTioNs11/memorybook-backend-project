const mongoose = require('mongoose');
const colors = require('colors')

const connetion = async ()=>
{
    try
    {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('mongoDBye bağlantı başarılı --- '  + conn.connection.name)
    }
    catch (error)
    {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connetion;