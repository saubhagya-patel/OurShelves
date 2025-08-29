import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth_util } from '../util/index.js';

// Helper function to generate a JWT
function generateToken(userId, email) {
    const payload = { id: userId, email: email };
    // The token will expire in 1 day
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}

export const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
        return res.status(400).json({ message: "Please provide a valid email and a password of at least 6 characters." });
    }

    try {
        const existingUser = await auth_util.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        const newUser = await auth_util.createUser(email, password);

        // --- CHANGE: Auto-login by generating a token on registration ---
        const token = generateToken(newUser.id, newUser.email);

        res.status(201).json({
            message: "User registered successfully.",
            token: token,
            user: {
                id: newUser.id,
                email: newUser.email,
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error during registration." });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide both email and password." });
    }

    try {
        const user = await auth_util.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = generateToken(user.id, user.email);

        res.status(200).json({
            message: "Login successful.",
            token: token,
            user: {
                id: user.id,
                email: user.email,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login." });
    }
};
