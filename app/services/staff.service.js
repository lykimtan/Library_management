const {ObjectId, ReturnDocument} = require('mongodb');
const bcrypt = require('bcrypt');

class StaffService {
    constructor(client) {
        this.Staff = client.db().collection('staffs');
    }

    extractStaffData(payload) {
        if (!payload || typeof payload !== 'object') return {};
        const staff = {
            name: payload.name,
            position: payload.position,
            address: payload.address,
            email: payload.email,
            phone: payload.phone,
            password: payload.password
        };
        Object.keys(staff).forEach(
            (key) => staff[key] === undefined && delete staff[key]
        );
        return staff;
    }

    extractStaffDataForUpdate(payload) {
        if (!payload || typeof payload !== 'object') return {};
        const staff = {
            name: payload.name,
            position: payload.position,
            address: payload.address,
            email: payload.email,
            phone: payload.phone,
        };
        return staff;
    }

    async create(payload) {
        const staff = this.extractStaffData(payload);
        const existing = await this.Staff.findOne({ email: staff.email });
            if (existing) {
             throw new Error("Email đã tồn tại");
        }
        const existingphone = await this.Staff.findOne({ phone: staff.phone });
            if (existingphone) {
             throw new Error("Số điện thoại đã tồn tại");
        }
        if(staff.password) {
            staff.password = await bcrypt.hash(staff.password, 10);
        }
        const result = await this.Staff.insertOne(
            staff
        );
        return result;
    }

    async login(email, password) {
        const staff = await this.Staff.findOne({ email });
        if (!staff || !staff.password) return null;
        const isMatch = await bcrypt.compare(password, staff.password);
        return isMatch ? staff : null;
    }

    async find(filter) {
        const cursor = await this.Staff.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.Staff.findOne({ _id: new ObjectId(id) });
    }

     async updateInfo(id, payload) {
           const filter = {
               _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
           };
       
           const update = this.extractStaffDataForUpdate(payload);
   
           const result = await this.Staff.findOneAndUpdate(
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
       
           const result = await this.Staff.findOneAndUpdate(
               filter,
               { $set: { password: hashedPassword } },
               { returnDocument: 'after' }
           );
       
           return result;
       }

    async delete(id) {
        if (!ObjectId.isValid(id)) return null;
        const result = await this.Staff.findOneAndDelete({
            _id: new ObjectId(id),
        });
        return result;
    }
}

module.exports = StaffService;
