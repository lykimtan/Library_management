const ApiError = require("../api-error");
const BookService = require('../services/book.service');
const MongoDB = require('../utils/mongodb.util');
const LibraryService = require('../services/library.service');
const { application } = require("express");

exports.borrowRequest = async (req, res, next) => {
    const { readerId, bookId, expectedReturnDate } = req.body;
    if (!readerId || !bookId || !expectedReturnDate) {
        return next(new ApiError(400, "All fields are required"));
    }

    const expectedDate = new Date(expectedReturnDate);
    const today = new Date();
    
    if(isNaN(expectedDate.getTime())) {
        return next(new ApiError(400, "Invalid date format"));
    }
    
    // Chỉ so sánh ngày, không so sánh giờ
    expectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if(expectedDate <= today) {  // <= để không cho phép ngày hôm nay
        return next(new ApiError(400, "Expected return date must be after today"));
    }

    try {
        const libraryService = new LibraryService(MongoDB.client);
        const document = await libraryService.borrowRequest(readerId, bookId, expectedReturnDate);
        return res.status(201).json(document);
    } catch (error) {
        if(error.message.includes('Invalid reader or book ID')) {
            return next(new ApiError(400, "BookId or readerId is not found"))
        }
        console.error("Borrow Request Error:", error);
        if(error.message.includes('Book is not available for borrowing')) {
            return next(new ApiError(400, "Book is not available for borrowing"));
        }
        if(error.message.includes('You must pay your fine before borrowing a book')) {
            return next(new ApiError(404, "You must pay your fine before borrowing a book"));
        }
        if(error.message.includes('You cannot borrow books because your point is very low')) {
            return next(new ApiError(404, "You cannot borrow books because your point is very low"));
        }
        return next(new ApiError(500, "An error occurred while processing the borrow request"));
    }
}

exports.deleteBorrowRequest = async (req, res, next) => {
    const borrowId = req.params.id;
    if (!borrowId) {
        return next(new ApiError(400, "Borrow ID is required"));
    }
    try {
        const libraryService = new LibraryService(MongoDB.client);
        const result = await libraryService.deleteBorrowRequest(borrowId);
        if (!result) {
            return next(new ApiError(404, "Borrow request not found"));
        }
        return res.status(200).json({ message: "Borrow request deleted successfully" });
    } catch (error) {
        console.error("Delete Borrow Request Error:", error);
        return next(new ApiError(500, "An error occurred while deleting the borrow request"));
    }
}

exports.findAllBorrowRequests = async (req, res, next) => {
    try {
        const libraryService = new LibraryService(MongoDB.client);
        const documents = await libraryService.findBorrowRequests({});
        return res.status(200).json(documents);
    } catch (error) {
        console.error("Find All Borrow Requests Error:", error);
        return next(new ApiError(500, "An error occurred while retrieving borrow requests"));
    }
}

exports.findBorrowRequestById = async (req, res, next) => {
    const borrowId = req.params.id;
    if(!borrowId) {
        return next(new ApiError(400, "BorrowId are requested"));
    }
    try{
        const libraryService = new LibraryService(MongoDB.client);
        const result = await libraryService.findBorrowRequestById(borrowId);
        if(!result) {
            return next(new ApiError(400,"Borrow Request can not be found"));
        }
        return res.status(200).json(result);
    }
    catch(error) {
        console.log(error);
        return next(new ApiError(500, "Some thing went wrong while searching borrow request"));
    }
}

exports.findRequestByStatus = async (req, res, next) => {
    const status = req.params.status;

    try {
        const libraryService = new LibraryService(MongoDB.client);
        const documents = await libraryService.findRequestByStatus(status);

        res.status(200).json(documents); // ✅ gửi phản hồi về client
    } catch (error) {
        console.log(error)
        return next(new ApiError(500, "Some thing went wrong while searching borrow request"));
    }
};

exports.approveRequest = async (req, res, next) => {
    const {staffId, borrowId} = req.body;
    if(!staffId || !borrowId) {
        return next ( new ApiError(400, "staffId or borrowId is Invalid"));
    }
    try {
        const libraryService = new LibraryService(MongoDB.client);
        const result = await libraryService.approveRequest(borrowId, staffId);
        if(!result) {
            return next(new ApiError(400, "Can not appprove this request"));
        }
        res.status(200).json(result)
    }
    catch(error) {
        console.log(error);
        return next(new ApiError(500, "Some thing went wrong while approve request"));
    }

}

exports.rejectRequest = async (req, res, next) => {
    const {staffId, borrowId, reason} = req.body;
    if(!staffId || !borrowId) {
        return next(new ApiError(400, "staffId or borrowId is invalid"))
    }
    try {
        const libraryService = new LibraryService(MongoDB.client);
        const result = await libraryService.rejectRequest(borrowId, staffId, reason);
        if(!result) {
            return next(new ApiError(500, "Something went wrong when rejected request"));
        }
        res.status(200).json(result);
    }
    catch(error) {
        if(error.message.includes("BorrowId is not found")){
            return next(new ApiError(400, "BorrowId not found"));
        }
        console.log(error);
        return next( new ApiError(500, "Some thing went wrong with server while rejected borrow request"));
    }
}

exports.returnBook = async (req, res, next) => {
    const {borrowId, returnStaffId} = req.body;
    if(!returnStaffId || !borrowId) {
        return next(new ApiError(400, "ReturnStaffId and borrowId are required"));
    }
    try {
        const libraryService = new LibraryService(MongoDB.client);
        const result = await libraryService.returnBook(borrowId, returnStaffId);
        if(!result) {
            return next (new ApiError(500, "Something went wrong while return book"))
        }
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return next (new ApiError(500, "Can not return book"));
    }
}

exports.lostBook = async (req, res, next) => {
    const {borrowId, returnStaffId} = req.body;
    if(!returnStaffId || !borrowId) {
        return next(new ApiError(400, "ReturnStaffId and borrowId are required"));
    }
    try {
        const libraryService = new LibraryService(MongoDB.client);
        const result = await libraryService.lostBook(borrowId, returnStaffId);
        // if(!result) {
        //     return next (new ApiError(500, "Something went wrong while lost book"))
        // }
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return next (new ApiError(500, "Can not lost book"));
    }
}