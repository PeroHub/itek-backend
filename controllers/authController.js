const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// @route   POST /api/auth/register (for initial admin setup, can be disabled after first run)
// @desc    Register a new admin user
// @access  Public
exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, password });
        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            jwtConfig.jwtSecret,
            { expiresIn: jwtConfig.jwtExpiration },
            (err, token) => {
                if (err) throw err;
                res.json({ token, msg: 'Admin registered successfully. Please keep this token safe.' });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            jwtConfig.jwtSecret,
            { expiresIn: jwtConfig.jwtExpiration },
            (err, token) => {
                if (err) throw err;
                res.json({ token, msg: 'Login successful!' });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/auth/me
// @desc    Get logged in admin user (for dashboard)
// @access  Private
exports.getAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};