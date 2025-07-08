const mongoose = require('mongoose');//thu vien nay giup lam viec voi mongo theo kieu doi tuong


const sachSchema = new mongoose.Schema({
    tensach: {type: String, required: true},
    dongia: Number,
    soquyen: Number,
    nxb: { type: mongoose.Schema.Types.ObjectId, ref: "NXB", required:true}
})

module.exports = mongoose.model("Sach", sachSchema);