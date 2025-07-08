const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema({
    hoLot: {type: String, required: true},
    ten: String,
    ngaySinh: {type: Date},
    phai: {type: String, enum:['Nam', 'Nu']},
    diachi: String,
    dt: String,
});

module.exports = mongoose.model("Reader", readerSchema);