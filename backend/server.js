const express = require("express");
const dotenv = require('dotenv').config();
const { errorCatching } = require('./middlewares/errorMiddleware');
const multer = require('multer');
const PORT = process.env.PORT;
const path = require('path')
const connection = require('./config/db');
const cors = require('cors');
const app = express();

// backend ilk çalışırken konsol ekranına verilen mesaj
const firstStartMessage = () => {
    console.log('Bu backend servisi ' + PORT + ' portu üzerinden çalışır durumda.');
  }


// cors usage
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.options('*', cors());


// API index sayfası
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'managementLogin.html'));
});

// routes
app.use('/api/admins', require('./routes/admin.route')); // admin route
app.use('/api/hotels', require('./routes/hotels.route')); // hotel route
app.use('/api/raffles', require('./routes/raffle.route')); // raffle route

// call db connection
connection();

// API'nin dinlediği portu ayarlama
app.listen(PORT, firstStartMessage);