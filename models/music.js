const mongoose = require('mongoose');

const MusicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', default: null },
    genre: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Music', MusicSchema);
