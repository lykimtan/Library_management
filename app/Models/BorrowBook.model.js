const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
   reader: { type: mongoose.Schema.Types.ObjectId, ref: "Reader", required:true},
   book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required:true},
   ngayMuon: {type: Date, default: Date.now},
   ngayTra: {type: Date, default: null},
   status: {
        type: String,
        enum: ['DangMuon', 'DaTra'],
        default: 'DangMuon',
   }
});

module.exports = mongoose.model("BorrowBook", borrowSchema);