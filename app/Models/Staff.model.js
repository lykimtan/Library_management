const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    hotenNV: { type: String, required: true },
    password: { type: String, required: true }, 
    chucVu: { type: String, enum: ['Admin', 'Thủ thư', 'Nhân viên'], default: 'Nhân viên' },
    diaChi: String,
    sdt: String
});

module.exports = mongoose.model("NhanVien", staffSchema);