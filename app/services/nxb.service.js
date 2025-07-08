const {ObjectId, ReturnDocument} = require('mongodb');
const BookService = require('./book.service');
const MongoDB = require('../utils/mongodb.util'); // Đảm bảo đã require đúng


class NXBService {
    constructor(client) {
        this.NXB = client.db().collection('nxbs');
        this.bookService = new BookService(client);
    }


    extractNXBData(payload) {
        if(!payload || typeof payload !== 'object') return {};
        
        const nxb = {
            tennxb: payload.tennxb,
            diaChi: payload.diaChi,
        };
    Object.keys(nxb).forEach(
        (key) => nxb[key] === undefined && delete nxb[key]
    );
    return nxb;
    }

    async create(payload) {
        const nxb = this.extractNXBData(payload);
        const result = await this.NXB.findOneAndUpdate(
            { tennxb: nxb.tennxb , diaChi: nxb.diaChi },
            { $set: nxb },
            { returnDocument: 'after', upsert: true }
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.NXB.find(filter);
        return await cursor.toArray();
    }

    async findByName(tennxb) {
        return await this.find({
            tennxb: { $regex: new RegExp(tennxb), $options: 'i' }, 
        });
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.NXB.findOne({ _id: new ObjectId(id) });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractNXBData(payload);
        const result = await this.NXB.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: 'after' }
        );
        return result;
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) return null; 
        const bookCount = await this.bookService.countByNXB(id);
        if (bookCount > 0) {
            return null;
        }
        const result = await this.NXB.findOneAndDelete({
            _id: new ObjectId(id),
        });
        return result;  
    }

}

module.exports = NXBService;



