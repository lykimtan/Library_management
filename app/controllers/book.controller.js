const ApiError = require("../api-error");
const BookService = require('../services/book.service');
const MongoDB = require('../utils/mongodb.util');



exports.createSach = async (req, res, next) => {
    const { tensach, dongia, soquyen, nxb} = req.body;
    if(!tensach) {
        return next(new ApiError(400, "Tên sách không được bỏ trống"));
    };
    try {
        const book = new BookService(MongoDB.client);
        const document = await book.create(req.body)
        return res.status(201).json(document);
    }catch(error) {
        return next(
            new ApiError(500, "An error occurred while creating book")
        );
    }
};


exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const book = new BookService(MongoDB.client);
        const { tensach} = req.query;
        if(tensach) {
            documents = await book.findByName(tensach);
        }else {
            documents = await book.find({});
        }
    }catch(error) {
        return next(
            new ApiError(500, "An error Occurred while retrieving books")
        );
    }
    return res.send(documents);
};

exports.findOne = async(req,res, next) =>{
    try {
        const book = new BookService(MongoDB.client);
        const document = await book.findById(req.params.id);
        if(!document) {
            return next(new ApiError(404, "Books not found"));
        }
        return res.send(document);
    }catch(error) {
        return next(
            new ApiError(
                500,
                `Error retrieving books with id=${req.params.id}`
            )
        );
    }
}

exports.findByNXB = async (req, res, next) => {
    try {
        const book = new BookService(MongoDB.client);
        const documents = await book.findByNXB(req.params.nxbId);
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving books for NXB with id=${req.params.nxbId}`)
        );
    }
};

exports.update = async (req, res, next) => {
    if(!req.body) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const book = new BookService(MongoDB.client);
        const document = await book.update(req.params.id, req.body);
        if(!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was updated successfully"});

    } catch (error) {
        return next(
            new ApiError(500, `Error updating book with id=${req.params.id}`)
        );
    }
}


exports.delete = async (req, res, next) => {
    try {
        const book = new BookService(MongoDB.client);
        const document = await book.delete(req.params.id);
        if(!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was deleted successfully"});
    } catch (error) {
        return next(
            new ApiError(500, `Error deleting book with id=${req.params.id}`)
        );
    }
}

exports.deleteAll = async (req, res, next) => {
    try {
        const book = new BookService(MongoDB.client);
        const document = await book.deleteAll();
        return res.send({
            message: `${document.deletedCount} books were deleted successfully`
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all books")
        );
    }
}



