const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Music = require('../models/Music');

// Get an artist's profile
router.get('/:artistId', async (req, res) => {
    try {
        const artist = await User.findById(req.params.artistId).select('-passkey');
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        const songs = await Music.find({ uploadedBy: artist._id });
        res.json({ artist, songs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update artist profile (Only artist can update)
router.put('/:artistId', authenticateUser, authorizeRole([2]), async (req, res) => {
    try {
        const { name, bio } = req.body;
        const artist = await User.findById(req.params.artistId);

        if (!artist) return res.status(404).json({ message: 'Artist not found' });
        if (artist._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        artist.name = name || artist.name;
        artist.bio = bio || artist.bio;
        await artist.save();

        res.json({ message: 'Profile updated', artist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
