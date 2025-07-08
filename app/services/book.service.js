const {ObjectId, ReturnDocument} = require('mongodb');

class BookService {
    constructor(client) {
        this.Book = client.db().collection('Books');
    }

    extractBookData(payload) {
        if (!payload || typeof payload !== 'object') return {};
        const book = {
            tensach: payload.tensach,
            dongia: payload.dongia,
            soquyen: payload.soquyen,
            nxb: payload.nxb,
        };
    Object.keys(book).forEach(
        (key) => book[key] === undefined && delete book[key]
    );
    return book;
    }

    async create(payload) {
        const book = this.extractBookData(payload);
        if (book.nxb && typeof book.nxb === 'string' && ObjectId.isValid(book.nxb)) {
            book.nxb = new ObjectId(book.nxb);
        }
        const result = await this.Book.findOneAndUpdate(
            {tensach: book.tensach},
            { $set: book},
            { returnDocument: 'after', upsert: true}
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.Book.find(filter);
        return await cursor.toArray();
    }

    async findByName(tensach) {
        return await this.find({
            tensach: { $regex: new RegExp(tensach), $options: 'i'},
        })
    }

    async findById(id) {
        return await this.Book.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async findByNXB(nxbId) {
        if (!ObjectId.isValid(nxbId)) return [];
        return await this.find({nxb: new ObjectId(nxbId)});
    }

    
    async countByNXB(nxbId) {
        if (!ObjectId.isValid(nxbId)) {
            return 0;
        }
        const oid = new ObjectId(nxbId);
        return await this.Book.countDocuments({
                 nxb: oid 
        });
    }
    
    async update(id, payload){
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractBookData(payload);
        const result = await this.Book.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async updateQuantity(bookId, delta) {
        if (!ObjectId.isValid(bookId)) {
            throw new Error("Invalid book ID");
        }
    
        const result = await this.Book.findOneAndUpdate(
            { _id: new ObjectId(bookId) },
            { $inc: { soquyen: delta } },
            { returnDocument: "after" } // trả về bản ghi sau khi cập nhật
        );
    
        if (!result) {
            throw new Error("Book not found or failed to update quantity");
        }
    
        return result; 
    }

    async delete(id) {
        const result = await this.Book.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) :null
        })
        return result;
    }

    async deleteAll() {
        const result = await this.Book.deleteMany({});
        return result;
    }

    // async delete(id) {
    //     const result = await this.Contact.findOneAndDelete({
    //         _id: ObjectId.isValid(id) ? new ObjectId(id) : null, 
    //     });
    //     return result;
    // }
}

module.exports = BookService;

