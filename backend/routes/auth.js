const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup Route with Password Validation
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Password validation
        const passwordErrors = [];
        if (password.length < 8) passwordErrors.push("at least 8 characters");
        if (!/[A-Z]/.test(password)) passwordErrors.push("one uppercase letter");
        if (!/[a-z]/.test(password)) passwordErrors.push("one lowercase letter");
        if (!/\d/.test(password)) passwordErrors.push("one number");
        if (!/[!@#$%^&]/.test(password)) passwordErrors.push("one special character (!@#$%^&)");

        if (passwordErrors.length > 0) {
            return res.status(400).json({message: `Password must include: ${passwordErrors.join(", ")}`});
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;