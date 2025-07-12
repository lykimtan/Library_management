const {ObjectId, ReturnDocument} = require('mongodb');
const BookService = require('./book.service');
const ReaderService =  require('./reader.service');
const StaffService = require('./staff.service');
const MongoDB = require('../utils/mongodb.util'); 


class LibraryService {
    constructor(client) {
        this.client = client;
        this.bookService = new BookService(client);
        this.readerService = new ReaderService(client);
        this.staffService = new StaffService(client);
        this.libraryService = client.db().collection('borrows');
    }

    extractLibraryData(payload) {
        if (!payload || typeof payload !== 'object') return {};
        const library = {
            bookId: payload.bookId,
            readerId: payload.readerId,
            createdDate: payload.createdDate,
            status: payload.status,
            expectedReturnDate: payload.expectedReturnDate,
            returnDate: payload.returnDate,
        };
        Object.keys(library).forEach(
            (key) => library[key] === undefined && delete library[key]
        );
        return library;
    }

    async borrowRequest(readerId, bookId, expectedReturnDate) {
        if (!ObjectId.isValid(readerId) || !ObjectId.isValid(bookId)) {
            throw new Error("Invalid reader or book ID");
        }
        
        const book = await this.bookService.findById(bookId);
        if (!book || book.soquyen === 0) {
            throw new Error("Book is not available for borrowing");
        }

  
        
        const reader = await this.readerService.findById(readerId);
        if (!reader) {
            throw new Error("Reader not found");
        }

        if(reader.fine > 0) {
            throw new Error("You must pay your fine before borrowing a book");
        }
        if(reader.point <= 0) {
            throw new Error("You cannot borrow books because your point is very low");
        }

        // Create borrow request data
        const borrowData = this.extractLibraryData({
            bookId: bookId,
            readerId: readerId,
            status: 'pending',
            createdDate: new Date(),
            expectedReturnDate: expectedReturnDate,
        });

        // Insert borrow request into the library collection
        const result = await this.libraryService.insertOne(borrowData);
        if (!result.acknowledged) {
            throw new Error("Failed to create borrow request");
        }

        return {
            _id: result.insertedId,
            ...borrowData,
        };

    }

    async findBorrowRequests(filter) {
        const cursor = await this.libraryService.find(filter);
        return await cursor.toArray();  
    }

    async findBorrowRequestById(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error("Invalid borrow request ID");
        }
        const borrowRequest = await this.libraryService.findOne({ _id: new ObjectId(id) });
        if (!borrowRequest) {
            throw new Error("Borrow request not found");
        }
        return borrowRequest;
    }

    async checkReturnedLate(dateExpected, dateReturned){
        if (!dateExpected || !dateReturned) return false;
        const expectedDate = new Date(dateExpected);
        const returnedDate = new Date(dateReturned);
        return returnedDate > expectedDate;  // Trả về true nếu trả trễ
    } 

    async countDaylate(dateExpected, dateReturned){
        if (!dateExpected || !dateReturned) return 0;
        const expectedDate = new Date(dateExpected);
        const returnedDate = new Date(dateReturned);
        const diffTime = Math.abs(returnedDate - expectedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    } 

    async deleteBorrowRequest(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error("Invalid borrow request ID");
        }
        const result = await this.libraryService.findOneAndDelete({ _id: new ObjectId(id) });
        if (!result) {
            throw new Error("Borrow request not foundd");
        }
        return result;
    }

    async findRequestByStatus(status) {
        const cursor = await this.libraryService.find({status});
        return cursor.toArray();
    }


    async approveRequest(borrowId,  staffId ) 
    {
        if(!ObjectId.isValid(borrowId) || !ObjectId.isValid(staffId)) {
            throw new Error("Invalid borrowId or staffId");
        }

        const checkBorrowId = await this.libraryService.find({_id: borrowId});
        const borrowRequest = await this.findBorrowRequestById(borrowId);
        const checkStaff = await this.staffService.find({ _id: staffId});
        if(!checkBorrowId){
            throw new Error("BorrowId is not found");
        }
        if(!checkStaff) {
            throw new Error("Staff is not found");
        }

        const filter = {
            _id: new ObjectId(borrowId),
            status: 'pending'
        };

        const update = {
            $set: {
                staffId: new ObjectId(staffId),
                status: 'approved',
                borrowDate: new Date(),
                updateDate: new Date()
            }
        };
        const updateQuantity = await this.bookService.updateQuantity(borrowRequest.bookId, -1 );
        if(!updateQuantity) {
            throw new Error("Failed to update book quantity");
        }
        const result = await this.libraryService.findOneAndUpdate(
            filter,
            update,
            {returnDocument: 'after'}
        )

        if(!result) {
            throw new Error("Something went wrong while approve request!")
        }

        return result;

    }

    async rejectRequest(borrowId,  staffId, reason ) 
    {
        if(!ObjectId.isValid(borrowId) || !ObjectId.isValid(staffId)) {
            throw new Error("Invalid borrowId or staffId");
        }

        const checkBorrowId = await this.findBorrowRequestById(borrowId);
        const checkStaff = await this.staffService.find({ _id: staffId});
        if(!checkBorrowId){
            throw new Error("BorrowId is not found");
        }
        if(!checkStaff) {
            throw new Error("Staff is not found");
        }

        const filter = {
            _id: new ObjectId(borrowId),
            status: 'pending'
        };

        const update = {
            $set: {
                staffId: new ObjectId(staffId),
                status: 'reject',
                reason: reason,
                updateDate: new Date()
            }
        };

        const result = await this.libraryService.findOneAndUpdate(
            filter,
            update,
            {returnDocument: 'after'}
        )

        if(!result) {
            throw new Error("Something went wrong while rejected request!")
        }

        return result;

    }

    //returnbook

    async returnBook(borrowId, returnStaffId) {
        const filter = {
            _id: new ObjectId(borrowId),
            status: "approved"
        }

        const update = {
            $set: {
                returnStaffId: new ObjectId(returnStaffId),
                returnDate: new Date(),
                updateDate: new Date(),
                status: "returned"
            }
        }
        const result = await this.libraryService.findOneAndUpdate(
            filter,
            update,
            {returnDocument: 'after'}
        )
        const borrowRequest = await this.findBorrowRequestById(borrowId);
        const bookId = borrowRequest.bookId;
        const updateQuantity = await this.bookService.updateQuantity(bookId, +1);

        //check date late
        const isLate = await this.checkReturnedLate(borrowRequest.expectedReturnDate, borrowRequest.returnDate);
        if(isLate) {
            const countDateLate = await this.countDaylate(borrowRequest.expectedReturnDate, borrowRequest.returnDate);
            const minusPoint = countDateLate * 10;
            const readerId = borrowRequest.readerId;
            const updateReader = await this.readerService.updatePoint(readerId, -minusPoint);
        }
        return result;
    }

    async lostBook(borrowId, returnStaffId) {
        const filter = {
            _id: new ObjectId(borrowId),
            status: "approved"
        }

        const update = {
            $set: {
                returnStaffId: new ObjectId(returnStaffId),
                status: "lost"
            }
        }
        const result = await this.libraryService.findOneAndUpdate(
            filter,
            update,
            {returnDocument: 'after'}
        )
        const borrowRequest = await this.findBorrowRequestById(borrowId);
        const bookId = borrowRequest.bookId;
        const book = await this.bookService.findById(bookId);
        const fine = book.dongia * 2;
        const updateReader = await this.readerService.updatePoint(borrowRequest.readerId, -10);
        const updateFine = await this.readerService.updateFine(borrowRequest.readerId, +fine);
        return result;
    }

}

    


module.exports = LibraryService;
