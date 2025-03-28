const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: { type: String, required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Music' }]
});

module.exports = mongoose.model('Album', AlbumSchema);
