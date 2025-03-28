const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const Album = require('../models/Album');
const Music = require('../models/Music');

// Create a new album
router.post('/', authenticateUser, authorizeRole([2]), async (req, res) => {
    try {
        const { title, coverImage } = req.body;
        const album = new Album({ title, artist: req.user.userId, coverImage, songs: [] });
        await album.save();
        res.status(201).json({ message: 'Album created', album });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add songs to an album
router.put('/:albumId/add-songs', authenticateUser, authorizeRole([2]), async (req, res) => {
    try {
        const { songs } = req.body; // Array of song IDs
        const album = await Album.findById(req.params.albumId);
        if (!album) return res.status(404).json({ message: 'Album not found' });

        if (album.artist.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        album.songs.push(...songs);
        await album.save();

        await Music.updateMany(
            { _id: { $in: songs } },
            { album: album._id }
        );

        res.json({ message: 'Songs added to album', album });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all albums
router.get('/', async (req, res) => {
    try {
        const albums = await Album.find().populate('artist', 'name').populate('songs');
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
