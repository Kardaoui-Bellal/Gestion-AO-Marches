require("dotenv").config();

const app = require("./src/app");
const db = require("./config/db");

const PORT = process.env.PORT ;

async function startServer() {
    try {
        // Test database connection
        const connection = await db.getConnection();
        console.log("MySQL connected.");
        connection.release();

        // Start Express
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error("Failed to start server.");
        console.error(err.message);
        process.exit(1);
    }
}

startServer();