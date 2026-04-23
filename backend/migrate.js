import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import { log } from "console";



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
        const schemaPath = path.join(__dirname, "config", "schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf-8");

        await client.query(schemaSql);
        console.log("database migration completed successfully")
        
    } catch (err) {
        console.error("error occurred while running migration:", err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();