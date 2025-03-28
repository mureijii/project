const express = require('express');
const router = express.Router();
const Album = require('../models/Album');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');

// Create a new album (Artist Only)
router.post('/', authenticateUser, authorizeRole([2]), async (req, res) => {
    try {
        const { title, songs } = req.body;
        const newAlbum = new Album({ title, artist: req.user.userId, songs });
        await newAlbum.save();
        res.status(201).json(newAlbum);
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

// Get a specific album by ID
router.get('/:id', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id).populate('artist', 'name').populate('songs');
        if (!album) return res.status(404).json({ message: 'Album not found' });
        res.json(album);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add songs to an album (Artist Only)
router.put('/:id', authenticateUser, authorizeRole([2]), async (req, res) => {
    try {
        const { songs } = req.body;
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ message: 'Album not found' });

        if (album.artist.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        album.songs.push(...songs);
        await album.save();
        res.json(album);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
