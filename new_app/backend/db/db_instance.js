import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Client } = pg;

let db; // cached client

export const connectDB = async () => {
    if (db) { return db; } // reuse existing connection

    const connectionString = process.env.DATABASE_URL;

    db = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        await db.connect();
        console.log("✅ Connected to PostgreSQL database");

        // Initialize database schema
        await initializeDatabase(db);
    } catch (error) {
        console.error("❌ Database connection or initialization failed:", error.message);
        throw error;
    }

    return db;
};

// ---- Private helper to initialize DB ----
const initializeDatabase = async (client) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const sqlPath = path.join(__dirname, "db_init.sql");

        const sql = fs.readFileSync(sqlPath, "utf8");

        await client.query(sql);
        console.log("✅ Database initialized successfully");
    } catch (err) {
        console.error("❌ Failed to initialize database:", err.message);
    }
};

// Export a helper to get the connected client
export const getDB = () => {
    if (!db) throw new Error("Database not connected. Call connectDB() first.");
    return db;
};
