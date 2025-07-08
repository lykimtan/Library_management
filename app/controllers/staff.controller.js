const ApiError = require("../api-error");
const StaffService = require('../services/staff.service');
const MongoDB = require('../utils/mongodb.util');
const bcrypt = require('bcrypt');

exports.create = async (req, res, next) => {
    const { phone, password, email, address, position } = req.body;
    if (!phone || !password || !email || !address || !position) {
        return next(new ApiError(400, "You must fill all fields"));
    }
    try {
        const staff = new StaffService(MongoDB.client);
        const document = await staff.create(req.body);
        return res.status(201).json(document);
    } catch (error) {
        if (error.message.includes("Email đã tồn tại")) {
            return next(new ApiError(400, error.message));
        }
        if (error.message.includes("Số điện thoại đã tồn tại")) {
            return next(new ApiError(400, error.message));
        }
        console.error("Create Staff Error:", error);
        return next(new ApiError(500, "An error occurred while creating staff"));
    }
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ApiError(400, "Email and password are required"));
    }
    try {
        const staff = new StaffService(MongoDB.client);
        const document = await staff.login(email, password);
        if (!document) {
            return next(new ApiError(401, "Invalid email or password"));
        }
        return res.status(200).json(document);
    } catch (error) {
        console.error("Login Error:", error);
        return next(new ApiError(500, "An error occurred while logging in"));
    }
}

exports.findOne = async (req, res, next) => {
    const staffId = req.params.id;
    if (!staffId) {
        return next(new ApiError(400, "Staff ID is required"));
    }

    try {
        const staff = new StaffService(MongoDB.client);
        const document = await staff.findById(staffId);
        if (!document) {
            return next(new ApiError(404, "Staff not found"));
        }
        return res.status(200).json(document);
    } catch (error) {
        console.error("Find Staff Error:", error);
        return next(new ApiError(500, "An error occurred while finding staff"));
    }
}

exports.findAll = async (req, res, next) => {
    try {
        const staff = new StaffService(MongoDB.client);
        const documents = await staff.find({});
        return res.status(200).json(documents);
    } catch (error) {
        console.error("Find All Staff Error:", error);
        return next(new ApiError(500, "An error occurred while retrieving staff"));
    }
}

exports.updateInfo = async (req, res, next) => {
    const staffId = req.params.id;
    const { phone, email, address, position } = req.body;
    if (!phone || !email || !address || !position) {
        return next(new ApiError(400, "You must fill all fields"));
    }
    if (!staffId) {
        return next(new ApiError(400, "Staff ID is required"));
    }
    try {
        const staff = new StaffService(MongoDB.client);
        const document = await staff.updateInfo(staffId, req.body);
        if (!document) {
            return next(new ApiError(404, "Staff not found"));
        }
        return res.status(200).json(document);
    } catch (error) {
        console.error("Update Staff Error:", error);
        return next(new ApiError(500, "An error occurred while updating staff"));
    }
}

exports.changePassword = async(req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return next(new ApiError(400, "Missing required fields"));
    }
    try {
        const staff = new StaffService(MongoDB.client);
        const document = await staff.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, 'Staff not found'));
        }
        const isMatch = await bcrypt.compare(oldPassword, document.password);
        if (!isMatch) {
            return next(new ApiError(400, "Old password is incorrect"));
        }
        const updatedDocument = await staff.updatePassword(req.params.id, newPassword);
        res.status(200).json(updatedDocument);
    } catch (error) {
        console.error(error);
        next(new ApiError(500, 'Failed to change password'));
    }
}

exports.delete = async (req, res, next) => {
    const staffId = req.params.id;
    if (!staffId) {
        return next(new ApiError(400, "Staff ID is required"));
    }
    try {
        const staff = new StaffService(MongoDB.client);
        const document = await staff.delete(staffId);
        if (!document) {
            return next(new ApiError(404, "Staff not found"));
        }
        return res.status(200).json({ message: "Staff deleted successfully" });
    } catch (error) {
        console.error("Delete Staff Error:", error);
        return next(new ApiError(500, "An error occurred while deleting staff"));
    }
}