import './config/config.js';

import express from "express";
import cors from "cors";
import { connectDB } from './db/db_instance.js';

import { auth_router, book_router, guest_router, user_dashboard_router } from './routes/index.js';


const startServer = async () => {
    try {
        await connectDB();
        console.log("Database connected successfully.");

        const app = express();
        const port = process.env.PORT || 3000;

        // --- Middleware Setup ---
        app.use(cors());
        app.use(express.json());

        // --- API Routes ---
        app.use("/api/auth", auth_router);
        app.use("/api/book", book_router);
        app.use('/api/reviews', guest_router);
        app.use('/api/me', user_dashboard_router);

        app.listen(port, () => {
            console.log(`Server is running as an API at http://localhost:${port}`);
        });

    } catch (error) {
        console.error("Failed to connect to the database. Server will not start.");
        console.error(error.stack);
        process.exit(1);
    }
};

startServer();
