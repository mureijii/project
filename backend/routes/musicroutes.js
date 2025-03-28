const express = require('express');

const Music = require('../models/Music');

// Get recommended songs based on genre
router.get('/recommendations/:songId', async (req, res) => {
    try {
        const song = await Music.findById(req.params.songId);
        if (!song) return res.status(404).json({ message: 'Song not found' });

        const recommendations = await Music.find({ 
            genre: song.genre, 
            _id: { $ne: song._id } 
        }).limit(5);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();
const musicFile = './music.json';

// Read JSON
const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Get all songs
router.get('/', (req, res) => {
    const music = readJsonFile(musicFile);
    res.json(music);
});

module.exports = router;
