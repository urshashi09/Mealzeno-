import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false
    }   : false
})

async function runMigrations() {
    const client = await pool.connect();

    try{
        console.log("running database migration....")
        await client.query("BEGIN");

        const schemaPath = path.join(__dirname, "config", "schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf-8");
        await client.query(schemaSql);

        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const migrationsDir = path.join(__dirname, "migrations");

        if (fs.existsSync(migrationsDir)) {
            const migrationFiles = fs
                .readdirSync(migrationsDir)
                .filter((file) => file.endsWith(".sql"))
                .sort();

            for (const filename of migrationFiles) {
                const alreadyRun = await client.query(
                    "SELECT 1 FROM schema_migrations WHERE filename = $1",
                    [filename]
                );

                if (alreadyRun.rowCount > 0) {
                    continue;
                }

                const migrationPath = path.join(migrationsDir, filename);
                const migrationSql = fs.readFileSync(migrationPath, "utf-8");

                console.log(`applying migration: ${filename}`);
                await client.query(migrationSql);
                await client.query(
                    "INSERT INTO schema_migrations (filename) VALUES ($1)",
                    [filename]
                );
            }
        }

        await client.query("COMMIT");
        console.log("database migration completed successfully")
        
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("error occurred while running migration:", err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();
