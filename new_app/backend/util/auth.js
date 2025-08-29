import bcrypt from 'bcryptjs';
import { getDB } from "../db/db_instance.js";

/**
 * Finds a user in the database by their email address.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
export async function findUserByEmail(email) {
    try {
        const db = getDB();
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
}

/**
 * Creates a new user in the database.
 * @param {string} email - The new user's email.
 * @param {string} password - The new user's plain-text password.
 * @returns {Promise<object>} The newly created user object.
 */
export async function createUser(email, password) {
    try {
        // ADDED: Get the database instance
        const db = getDB();

        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await db.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
            [email, passwordHash]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error creating user:", error);
        // Rethrow the error to be handled by the controller, especially for duplicate email
        throw error;
    }
}

