import pool from "../config/db";

export const fetchUserById = async (id: string) => {
  const result = await pool.query("SELECT * FROM users WHERE id=$1", [
    id || null,
  ]);
  return result.rows[0];
};
