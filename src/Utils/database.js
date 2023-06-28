import sql from 'mssql';
import config from '../Model/config.js';


let pool;
// This function is used to connect to the database
export const connectDB = async () => {
  try {
    if (pool) return pool;
    pool = await sql.connect(config.sql);
    return pool;
  } catch (error) {
    throw new Error('Failed to connect to the database.');
  }
};
// This function is used to close the database connection
export const closeDB = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = undefined;
    }
  } catch (error) {
    throw new Error('Failed to close the database connection.');
  }
};
