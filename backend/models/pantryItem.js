import db from "../config/db.js";

function normalizeExpiryDate(value) {
    if (value == null || value === "") return null;

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            throw new Error("Invalid expiry date format. Use YYYY-MM-DD or DD-MM-YYYY.");
        }
        return value.toISOString().slice(0, 10);
    }

    if (typeof value !== "string") {
        throw new Error("Invalid expiry date format. Use YYYY-MM-DD or DD-MM-YYYY.");
    }

    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const dmyMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    let year, month, day;
    if (isoMatch) {
        [, year, month, day] = isoMatch;
    } else if (dmyMatch) {
        [, day, month, year] = dmyMatch;
    } else {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new Error("Invalid expiry date format. Use YYYY-MM-DD or DD-MM-YYYY.");
        }
        return date.toISOString().slice(0, 10);
    }

    const normalized = `${year}-${month}-${day}`;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime()) || date.getUTCFullYear() !== Number(year) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) {
        throw new Error("Invalid expiry date format. Use YYYY-MM-DD or DD-MM-YYYY.");
    }

    return normalized;
}


class pantryItem{


    static async create(userId, itemData){
        const { name, quantity, unit, category, expiryDate, expiry_date, is_running_low } = itemData;
        const normalizedExpiryDate = normalizeExpiryDate(expiryDate ?? expiry_date);

        const result = await db.query(
            `INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiry_date, is_running_low)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [userId, name, quantity, unit, category, normalizedExpiryDate, is_running_low]
        );
        return result.rows[0];
    }

    //get all pantry items for a user
    static async findByUserId(userId, filters = {}) {
        let query = `SELECT * FROM pantry_items WHERE user_id = $1`;
        const params = [userId];
        let paramCount= 1

        // Apply filters if provided
        if (filters.category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(filters.category);
        }

        if (filters.is_running_low !== undefined) {
            paramCount++;
            query += ` AND is_running_low = $${paramCount}`;
            params.push(filters.is_running_low);
        }

        if(filters.search){
            paramCount++;
            query += ` AND name ILIKE $${paramCount}`;
            params.push(`%${filters.search}%`);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await db.query(query, params);
        return result.rows;
    }

    static async getExpiringItems(userId, days) {
        const result = await db.query(
            `SELECT * FROM pantry_items 
             WHERE user_id = $1 
             AND expiry_date IS NOT NULL 
             AND expiry_date <= CURRENT_DATE + INTERVAL '${days} days'
             AND expiry_date >= CURRENT_DATE
             ORDER BY expiry_date ASC`,
            [userId]
        );
        return result.rows;
    }

    static async findByIdAndUserId(id, userId) {
        const result = await db.query(
            "SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2",
            [id, userId]
        );
        return result.rows[0];
    }


    static async update(id, userId, updates) {
        const { name, quantity, unit, category, expiryDate, expiry_date, is_running_low } = updates;
        const normalizedExpiryDate = normalizeExpiryDate(expiryDate ?? expiry_date);
        const result = await db.query(
            `UPDATE pantry_items SET
             name = COALESCE($1, name),
             quantity = COALESCE($2, quantity),
             unit = COALESCE($3, unit),
             category = COALESCE($4, category),
             expiry_date = COALESCE($5, expiry_date),
             is_running_low = COALESCE($6, is_running_low)
             WHERE id = $7 AND user_id = $8
             RETURNING *`,
            [name, quantity, unit, category, normalizedExpiryDate, is_running_low, id, userId]
        );
        return result.rows[0];
    }


    static async delete(id, userId) {
        const result = await db.query(
            "DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, userId]
        );
        return result.rows[0];
    }


    static async getStats(userId) {
        const result = await db.query(
            `SELECT
                COUNT(*) AS total_items,
                COUNT (DISTINCT category) AS total_categories,
                COUNT(*) FILTER (WHERE is_running_low) AS running_low_count,
                COUNT(*) FILTER (WHERE expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '7 days' AND expiry_date >= CURRENT_DATE) AS expiring_soon_count
            FROM pantry_items
            WHERE user_id = $1
        `, [userId]);
        return result.rows[0];
    }

}

export default pantryItem;
