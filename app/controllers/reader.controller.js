const ApiError = require("../api-error");
const ReaderService = require('../services/reader.service');
const MongoDB = require('../utils/mongodb.util');
const bcrypt = require('bcrypt');

exports.create = async (req, res, next) => {
    const {lastname, firstname, birthday, address, gender, password, email } = req.body;
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
        return next(new ApiError(400, "Invalid birthday format (YYYY-MM-DD)"));
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return next(new ApiError(400, "Invalid email format"));
    }
    try {
        const reader = new ReaderService(MongoDB.client);
        const document = await reader.create(req.body);
        res.status(201).json(document);
    } catch (error) {
        if(error.message.includes("Email đã tồn tại")) {
            return next(new ApiError(400, error.message));
        }
        console.error(error);
        next(new ApiError(500, 'Failed to create reader'));
    }
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ApiError(400, "Email and password are required"));
    }
    try {
        const reader = new ReaderService(MongoDB.client);
        const document = await reader.login(email, password);
        if (!document) {
            return next(new ApiError(401, "Invalid email or password"));
        }
        return res.status(200).json(document);
    } catch (error) {
        console.error("Login Error:", error);
        return next(new ApiError(500, "An error occurred while logging in"));
    }
}

exports.findAll = async (req, res, next)    => {
    try {
        const reader = new ReaderService(MongoDB.client);
        const documents = await reader.find({});
        res.status(200).json(documents);
    } catch (error) {
        console.error(error);
        next(new ApiError(500, 'Failed to retrieve readers'));
    }
};


exports.findOne = async (req, res, next) => {
    try {
        const reader = new ReaderService(MongoDB.client);
        const document = await reader.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, 'Reader not found'));
        }
        res.status(200).json(document);
    } catch (error) {
        next(new ApiError(500, 'Failed to retrieve reader'));
    }
};

exports.updateInfo = async (req, res, next) => {
    const {lastname, firstname, birthday, address, gender, email} = req.body;
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
        return next(new ApiError(400, "Invalid birthday format (YYYY-MM-DD)"));
    }
    if(!lastname || !firstname || !birthday || !address || !gender || !email) {
        return next(new ApiError(400, "Missing required fields"));
    }
    try {
        const reader = new ReaderService(MongoDB.client);
        const document = await reader.updateInfo(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, 'Reader not found'));
        }
        res.status(200).json(document);
    } catch (error) {
        next(new ApiError(500, 'Failed to update reader'));
    }
};


exports.changePassword = async(req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return next(new ApiError(400, "Missing required fields"));
    }
    try {
        const reader = new ReaderService(MongoDB.client);
        const document = await reader.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, 'Reader not found'));
        }
        const isMatch = await bcrypt.compare(oldPassword, document.password);
        if (!isMatch) {
            return next(new ApiError(400, "Old password is incorrect"));
        }
        const updatedDocument = await reader.updatePassword(req.params.id, newPassword);
        res.status(200).json(updatedDocument);
    } catch (error) {
        console.error(error);
        next(new ApiError(500, 'Failed to change password'));
    }
}

exports.delete = async (req, res, next) => {
    const readerId = req.params.id;
    if (!readerId) {
        return next(new ApiError(400, "Reader ID is required"));
    }
    try {
        const reader = new ReaderService(MongoDB.client);
        const document = await reader.delete(readerId);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        res.status(200).json({ message: "Reader deleted successfully" });
    } catch (error) {
        console.error("Delete Reader Error:", error);
        return next(new ApiError(500, "An error occurred while deleting reader"));
    }
}

exports.payFine = async (req, res, next) => {
    const readerId = req.params.id;
    if (!readerId) {
        return next(new ApiError(400, "Reader ID is required"));
    }
    try {
        const reader = new ReaderService(MongoDB.client);
        const document = await reader.payFine(readerId);
        if (!document) {
            return next(new ApiError(404, "Reader not found or fine already paid"));
        }
        res.status(200).json({ message: "Fine paid successfully" });
    } catch (error) {
        console.error("Pay Fine Error:", error);
        return next(new ApiError(500, "An error occurred while paying fine"));
    }
}
