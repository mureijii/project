const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    passkey: { type: String, required: true },
    authLevel: { type: Number, enum: [1, 2, 3], required: true } // 1-Admin, 2-Artist, 3-User
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
