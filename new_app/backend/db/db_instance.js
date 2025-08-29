import pg from "pg";

let db;

export const connectDB = async () => {
    // Only create a new client if one doesn't already exist.
    if (!db) {
        db = new pg.Client({
            user: process.env.PG_USER,
            host: process.env.PG_HOST,
            database: process.env.PG_DATABASE,
            password: process.env.PG_PASSWORD,
            port: process.env.PG_PORT,
        });

        try {
            await db.connect();
        } catch (error) {
            console.error("Database connection failed during initialization.");
            throw error;
        }
    }
    return db;
};

export const getDB = () => {
    if (!db) {
        throw new Error("Database not connected. Call connectDB first.");
    }
    return db;
};

