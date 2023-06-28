import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDB } from '../Utils/database.js';
import config from '../Model/config.js';
import sql from 'mssql';


export const loginRequired = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized user' });
  }
}

export const register = async (req, res, next) => {
  try {
    const { FirstName, SecondName, Email, Password, PhoneNumber } = req.body;
    const hashedPassword = bcrypt.hashSync(Password, 10);
    
    const pool = await connectDB();
    const result = await pool.request()
      .input('Email', sql.VarChar, Email)
      .query('SELECT * FROM Voters WHERE Email = @Email');
    const user = result.recordset[0];
    
    if (user) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }
    
    await pool.request()
      .input('FirstName', sql.VarChar, FirstName)
      .input('SecondName', sql.VarChar, SecondName)
      .input('Email', sql.VarChar, Email)
      .input('PhoneNumber', sql.VarChar, PhoneNumber)
      .input('Password', sql.VarChar, hashedPassword)
      .query('INSERT INTO Voters (FirstName, SecondName, Email, PhoneNumber, Password) VALUES (@FirstName, @SecondName, @Email, @PhoneNumber, @Password)');
    
    res.status(200).json({ message: 'Account created successfully' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { Email, Password } = req.body;

    const pool = await connectDB();

    // Query both Admins and Voters table for the given email
    const result = await pool.request()
      .input('Email', sql.VarChar, Email)
      .query(`
        SELECT * FROM Admins WHERE Email = @Email;
        SELECT * FROM Voters WHERE Email = @Email;
      `);

    // Check if the user exists in either table
    const adminUser = result.recordsets[0][0];
    const voterUser = result.recordsets[1][0];

    if (adminUser && bcrypt.compareSync(Password, adminUser.Password)) {
      const token = generateToken(adminUser.Email, true); // Generate admin token
      res.status(200).json({
        isAdmin: true,
        AdminID: adminUser.AdminID,
        Email: adminUser.Email,
        FirstName: adminUser.FirstName,
        SecondName: adminUser.SecondName,
        PhoneNumber: adminUser.PhoneNumber,
        token
      });
    } else if (voterUser && bcrypt.compareSync(Password, voterUser.Password)) {
      const token = generateToken(voterUser.Email, false); 
      res.status(200).json({
        isAdmin: false,
        VoterID: voterUser.VoterID,
        Email: voterUser.Email,
        FirstName: voterUser.FirstName,
        SecondName: voterUser.SecondName,
        PhoneNumber: voterUser.PhoneNumber,
        token
      });
    } else {
      res.status(401).json({ error: 'Authentication failed. Wrong credentials.' });
    }
  } catch (error) {
    next(error);
  }
};

const generateToken = (email, isAdmin) => {
  const payload = { email, isAdmin };
  return `JWT ${jwt.sign(payload, config.jwt_secret)}`;
};
