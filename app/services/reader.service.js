const {ObjectId, ReturnDocument} = require('mongodb');
const bcrypt = require('bcrypt');
class ReaderService {
    constructor(client) {
        this.Reader = client.db().collection('readers');
    }

    extractReaderData(payload) {
        if (!payload || typeof payload !== 'object') return {};
        const reader = {
            lastname: payload.lastname,
            firstname: payload.firstname,
            birthday: payload.birthday,
            gender: payload.gender,
            address: payload.address,
            email: payload.email,
            password: payload.password,
        };
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    }

    extractReaderDataForUpdate(payload) {
        if (!payload || typeof payload !== 'object') return {};
        const reader = {
            lastname: payload.lastname,
            firstname: payload.firstname,
            birthday: payload.birthday,
            gender: payload.gender,
            address: payload.address,
            email: payload.email,
        };
        if (
            typeof payload.password === 'string' &&
            payload.password.trim().length > 0
        ) {
            reader.password = payload.password;
        }
        return reader;
    }

    async create(payload) {
        const reader = this.extractReaderData(payload);
        const existing = await this.Reader.findOne({ email: reader.email });
            if (existing) {
             throw new Error("Email đã tồn tại");
        }
        if(reader.password) {
            reader.password = await bcrypt.hash(reader.password, 10);
        }
        const result = await this.Reader.insertOne(
            reader
        );
        return result;
    }

        async login(email, password) {
            const reader = await this.Reader.findOne({ email });
            if (!reader || !reader.password) return null;
            const isMatch = await bcrypt.compare(password, reader.password);
            return isMatch ? reader : null;
        }
    

    async find(filter) {
        const cursor = await this.Reader.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.Reader.findOne({ _id: new ObjectId(id) });
    }

    async updateInfo(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };

        const update = this.extractReaderDataForUpdate(payload);

        const result = await this.Reader.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: 'after' }
        );
        return result;
    }

    async updatePassword(id, newPassword) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
    
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        const result = await this.Reader.findOneAndUpdate(
            filter,
            { $set: { password: hashedPassword } },
            { returnDocument: 'after' }
        );
    
        return result;
    }

    async delete(id) {
        if (!ObjectId.isValid(id)) return null;
        const result = await this.Reader.findOneAndDelete({
            _id: new ObjectId(id),
        });
        return result;
    }
}

module.exports = ReaderService;