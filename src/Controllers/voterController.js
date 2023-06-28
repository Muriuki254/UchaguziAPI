import sql from 'mssql';
import { connectDB } from '../Utils/database.js';


export const castVote = async (req, res, next) => {
  try {
    const { PositionName, CandidateID } = req.body;
    const { VoterID } = req.query;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input('PositionName', sql.NVarChar(40), PositionName)
      .input('VoterID', sql.Int, VoterID)
      .input('CandidateID', sql.Int, CandidateID)
      .query(
        'INSERT INTO Votes (PositionName, VoterID, CandidateID) VALUES (@PositionName, @VoterID, @CandidateID)'
      );

    res.status(200).json({ message: 'Vote casted successfully' });
  } catch (error) {
    next(error);
  }
};


export const getVotingHistory = async (req, res, next) => {
  try {
    const { VoterID } = req.query;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input('VoterID', sql.Int, VoterID)
      .execute('GetVoterVotingHistory');

    res.status(200).json(result.recordset);
  } catch (error) {
    next(error);
  }
};

export const getElection = async (req, res, next) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM Elections');
  
    res.status(200).json(result.recordset);
  }catch (error) {
    next(error);
  }
};

export const getActiveElection =  async (req, res, next) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .query(`
        SELECT *
        FROM Elections
        WHERE GETDATE() >= StartDate AND GETDATE() <= EndDate
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    next(error);
  }
};
  
export const hasVoted = async (req, res, next) => {
  try {
    const { VoterID } = req.query;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input('VoterID', sql.Int, VoterID)
      .query('SELECT COUNT(*) AS VoteCount FROM Votes WHERE VoterID = @VoterID');

    const voteCount = result.recordset[0].VoteCount;
    const hasVoted = voteCount > 0;

    res.status(200).json({ hasVoted });
  } catch (error) {
    next(error);
  }
};



