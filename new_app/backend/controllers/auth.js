import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth_util } from '../util/index.js';

/**
 * Handles user registration.
 * POST /api/auth/register
 */
export async function register(req, res) {
    const { email, password } = req.body || {};

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        // Check if user already exists
        const existingUser = await auth_util.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: "User with this email already exists." });
        }

        // Create new user
        const newUser = await auth_util.createUser(email, password);
        res.status(201).json({
            message: "User created successfully.",
            user: {
                id: newUser.id,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Server error during registration." });
    }
}

/**
 * Handles user login.
 * POST /api/auth/login
 */
export async function login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const user = await auth_util.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." }); // Unauthorized
        }

        // Compare submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." }); // Unauthorized
        }

        // If credentials are correct, create a JWT
        const payload = {
            id: user.id,
            email: user.email,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token will be valid for 1 hour
        });

        res.status(200).json({
            message: "Login successful.",
            token: token,
        });

    } catch (error) {
        res.status(500).json({ error: "Server error during login." });
    }
}
