const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role, username) => {
    return jwt.sign({ id, role, username }, process.env.JWT_SECRET || 'fallback_smart_secret_123', {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password, // hashed by hook
            role: role || 'tourist',
        });

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role, user.username),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fallback Mock Login if DB fails to connect
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Provide email and password' });
        }

        try {
            const user = await User.findOne({ where: { email } });
            if (user && (await user.validPassword(password))) {
                res.json({
                    success: true,
                    data: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        token: generateToken(user.id, user.role, user.username),
                    },
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
        } catch (dbError) {
            // Fallback for Mock users if DB disconnected
            if (email === 'admin@smart.com' && password === 'admin') {
                return res.json({
                    success: true,
                    data: { id: 1, username: 'Admin User', email, role: 'admin', token: generateToken(1, 'admin', 'Admin User') }
                });
            } else if (email === 'tourist@smart.com' && password === 'tourist') {
                return res.json({
                    success: true,
                    data: { id: 2, username: 'Tourist User', email, role: 'tourist', token: generateToken(2, 'tourist', 'Tourist User') }
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials (DB down)' });
            }
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        res.json({ success: true, data: req.user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { registerUser, loginUser, getMe };
