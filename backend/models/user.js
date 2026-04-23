import db from "../config/db.js";
import bcrypt from "bcrypt";

class user{
    static async createUser(name, email, password){
        const hashedPassword = await bcrypt.hash(password, 10);

        const result= await db.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
            [name, email, hashedPassword]
        )
        return result.rows[0];
    }


    static async findByEmail(email){
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        )
        return result.rows[0];
    }

    static async findById(id){
        const result = await db.query(
            "SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE id = $1",
            [id]
        )
        return result.rows[0];
    }

    static async update(id,updates){
        const {name, email}= updates
        const result = await db.query(
            'UPDATE users SET name= COALESCE($1, name), email= COALESCE($2, email), updated_at=NOW() WHERE id = $3 RETURNING id, name, email, created_at, updated_at',
            [name, email, id]
        )
        return result.rows[0];  
        }

    static async updatePassword(id, newPassword){
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(
            'UPDATE users SET password_hash= $1, updated_at=NOW() WHERE id = $2 ',
            [hashedPassword, id]
        )
        
    }


    static async verifyPassword(plainPassword, hashedPassword){
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async delete(id){
        await db.query(
            "DELETE FROM users WHERE id = $1",
            [id]
        )
    }
}

export default user
