const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const usersFile = './users.json';

// Read & Write JSON
const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeJsonFile = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    let users = readJsonFile(usersFile);

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), name, email, password: hashedPassword };
    users.push(newUser);

    writeJsonFile(usersFile, users);
    res.status(201).json({ message: "User registered successfully" });
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let users = readJsonFile(usersFile);

    const user = users.find(user => user.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
});

module.exports = router;
