const ApiError = require("../api-error");
const NXBService = require('../services/nxb.service');
const MongoDB = require('../utils/mongodb.util');

exports.createNXB = async (req, res, next) => {
    const { tennxb, diachi } = req.body;
    if (!tennxb) {
        return next(new ApiError(400, "Tên nxb không được bỏ trống"));
    }
    try {
        const nxb = new NXBService(MongoDB.client);
        const document = await nxb.create(req.body);
        return res.status(201).json(document);
    } catch (error) {
        console.error("Create NXB Error:", error);
        return next(new ApiError(500, "An error occurred while creating nxb"));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const nxb = new NXBService(MongoDB.client);
        const { tennxb } = req.query;
        if (tennxb) {
            documents = await nxb.findByName(tennxb);
        } else {
            documents = await nxb.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while get all book")
        );
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const nxb = new NXBService(MongoDB.client);
        const document = await nxb.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "NXB not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving nxb with id=${req.params.id}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if(!req.body) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const nxb = new NXBService(MongoDB.client);
        const document = await nxb.update(req.params.id, req.body);
        if(!document) {
            return next(new ApiError(404, "NXB not found"));
        }
        return res.send({ message: "NXB was updated successfully"});
    } catch (error) {
        return next(
            new ApiError(500, `Error updating nxb with id=${req.params.id}`)
        );  
} 
}

exports.delete = async (req, res, next) => {
    try{
        const nxb = new NXBService(MongoDB.client);
        const document = await nxb.delete(req.params.id);
        if(!document) {
            return next(new ApiError(404, "Cannot delete NXB with associated books"));
        }
        return res.send({ message: "NXB was deleted successfully"});
    } catch (error) {
        return next(
            new ApiError(500, `Error deleting nxb with id=${req.params.id}`)
        );  
    }
}