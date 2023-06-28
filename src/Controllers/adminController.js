import bcrypt from 'bcrypt';
import { connectDB } from '../Utils/database.js';
import sql from 'mssql';

export const postAdmin = async (req, res, next) => {
  try {
    const { FirstName, SecondName, Email, PhoneNumber, Password } = req.body;
    const hashedPassword = bcrypt.hashSync(Password, 10);

    const pool = await connectDB();
    const result = await pool.request()
      .input('Email', sql.VarChar, Email)
      .query('SELECT * FROM Admins WHERE Email = @Email');
    const user = result.recordset[0];

    if (user) {
      res.status(409).json({ error: 'Admin already exists' });
      return;
    }

    await pool.request()
      .input('FirstName', sql.VarChar, FirstName)
      .input('SecondName', sql.VarChar, SecondName)
      .input('Email', sql.VarChar, Email)
      .input('PhoneNumber', sql.VarChar, PhoneNumber)
      .input('Password', sql.VarChar, hashedPassword)
      .query('INSERT INTO Admins (FirstName, SecondName, Email, PhoneNumber, Password) VALUES (@FirstName, @SecondName, @Email, @PhoneNumber, @Password)');

    res.status(200).json({ message: 'Admin created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (req, res, next) => {
  try {
    const { searchQuery } = req.query;

    let queryString = `
      SELECT C.CandidateID, C.FirstName, C.SecondName, C.Party, P.PositionName
      FROM Candidates C
      INNER JOIN Positions P ON C.PositionName = P.PositionName
    `;

    if (searchQuery) {
      queryString += ` WHERE C.FirstName LIKE '%${searchQuery}%' OR C.SecondName LIKE '%${searchQuery}%'`;
    }

    const pool = await connectDB();
    const result = await pool.request().query(queryString);

    const candidates = result.recordset;

    res.status(200).json(candidates);
  } catch (error) {
    next(error);
  }
};


export const postCandidate = async (req, res, next) => {
  try {
    const { FirstName, SecondName, Party, PositionName } = req.body;

    const pool = await connectDB();
    await pool
      .request()
      .input('FirstName', sql.VarChar, FirstName)
      .input('SecondName', sql.VarChar, SecondName)
      .input('Party', sql.VarChar, Party)
      .input('PositionName', sql.VarChar, PositionName)
      .query(
        'INSERT INTO Candidates (FirstName, SecondName, Party, PositionName) VALUES (@FirstName, @SecondName, @Party, @PositionName)'
      );

    res.status(200).json({ message: 'Candidate created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { FirstName, SecondName, Party, PositionName } = req.body;

    const pool = await connectDB();
    await pool
      .request()
      .input('CandidateID', sql.Int, id)
      .input('FirstName', sql.VarChar, FirstName)
      .input('SecondName', sql.VarChar, SecondName)
      .input('Party', sql.VarChar, Party)
      .input('PositionName', sql.VarChar, PositionName)
      .query(
        'UPDATE Candidates SET FirstName = @FirstName, SecondName = @SecondName, Party = @Party, PositionName = @PositionName WHERE CandidateID = @CandidateID'
      );

    res.status(200).json({ message: 'Candidate updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = await connectDB();
    await pool
      .request()
      .input('CandidateID', sql.Int, id)
      .query('DELETE FROM Candidates WHERE CandidateID = @CandidateID');

    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    next(error);
  }
};


export const getPositions = async (req, res, next) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .query('SELECT * FROM Positions');

    const positions = result.recordset;

    res.status(200).json(positions);
  } catch (error) {
    next(error);
  }
};

export const postPosition = async (req, res, next) => {
  try {
    const { PositionName } = req.body;

    const pool = await connectDB();
    await pool
      .request()
      .input('PositionName', sql.VarChar, PositionName)
      .query('INSERT INTO Positions (PositionName) VALUES (@PositionName)');

    res.status(200).json({ message: 'Position created successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePosition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = await connectDB();
    await pool
      .request()
      .input('PositionID', sql.Int, id)
      .query('DELETE FROM Positions WHERE PositionID = @PositionID');

    res.status(200).json({ message: 'Position deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updatePosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { PositionName } = req.body;

    const pool = await connectDB();
    await pool
      .request()
      .input('PositionID', sql.Int, id)
      .input('PositionName', sql.VarChar, PositionName)
      .query('UPDATE Positions SET PositionName = @PositionName WHERE PositionID = @PositionID');

    res.status(200).json({ message: 'Position updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const postElection = async (req, res, next) => {
  try {
    const { Title, StartDate, EndDate, ElectionStatus } = req.body;

    const pool = await connectDB();
    await pool
      .request()
      .input('Title', sql.VarChar(35), Title)
      .input('StartDate', sql.DateTime2(0), StartDate)
      .input('EndDate', sql.DateTime2(0), EndDate)
      .input('ElectionStatus', sql.VarChar(10), ElectionStatus)
      .query('INSERT INTO Elections (Title, StartDate, EndDate, ElectionStatus) VALUES (@Title, @StartDate, @EndDate, @ElectionStatus)');

    res.status(200).json({ message: 'Election created successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteElection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = await connectDB();
    await pool
      .request()
      .input('ElectionID', sql.Int, id)
      .query('DELETE FROM Elections WHERE ElectionID = @ElectionID');

    res.status(200).json({ message: 'Election deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Title, StartDate, EndDate, ElectionStatus } = req.body;

    const pool = await connectDB();
    await pool
      .request()
      .input('ElectionID', sql.Int, id)
      .input('Title', sql.VarChar(35), Title)
      .input('StartDate', sql.DateTime2(0), StartDate)
      .input('EndDate', sql.DateTime2(0), EndDate)
      .input('ElectionStatus', sql.VarChar(10), ElectionStatus)
      .query('UPDATE Elections SET Title = @Title, StartDate = @StartDate, EndDate = @EndDate, ElectionStatus = @ElectionStatus WHERE ElectionID = @ElectionID');

    res.status(200).json({ message: 'Election updated successfully' });
  } catch (error) {
    next(error);
  }
};
export const getCountDown = async (req, res, next) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT TOP 1 * FROM Elections ORDER BY ElectionID DESC');
    
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ message: 'No election found' });
    }
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const pool = await connectDB();
    const [candidateCountResult, voterCountResult, positionCountResult, electionCountResult] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as CandidateCount FROM Candidates'),
      pool.request().query('SELECT COUNT(*) as VoterCount FROM Voters'),
      pool.request().query('SELECT COUNT(*) as PositionCount FROM Positions'),
      pool.request().query('SELECT COUNT(*) as ElectionCount FROM Elections'),
    ]);

    const statistics = {
      candidateCount: candidateCountResult.recordset[0].CandidateCount,
      voterCount: voterCountResult.recordset[0].VoterCount,
      positionCount: positionCountResult.recordset[0].PositionCount,
      electionCount: electionCountResult.recordset[0].ElectionCount,
    };

    res.status(200).json(statistics);
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().execute('GetElectionResults');
    res.status(200).json(result.recordset);
  } catch (error) {
    next(error);
  }
};

export const postVoter = async (req, res, next) => {
  try {
    const { FirstName, SecondName, Email, PhoneNumber, Password } = req.body;
    const hashedPassword = bcrypt.hashSync(Password, 10);

    const pool = await connectDB();
    await pool
      .request()
      .input('FirstName', sql.VarChar, FirstName)
      .input('SecondName', sql.VarChar, SecondName)
      .input('Email', sql.VarChar, Email)
      .input('PhoneNumber', sql.VarChar, PhoneNumber)
      .input('Password', sql.VarChar, hashedPassword)
      .query(
        'INSERT INTO Voters (FirstName, SecondName, Email, PhoneNumber, Password) VALUES (@FirstName, @SecondName, @Email, @PhoneNumber, @Password)'
      );

    res.status(200).json({ message: 'Voter created successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteVoter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = await connectDB();
    await pool
      .request()
      .input('VoterID', sql.Int, id)
      .query('DELETE FROM Voters WHERE VoterID = @VoterID');

    res.status(200).json({ message: 'Voter deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateVoter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { FirstName, SecondName, Email, PhoneNumber } = req.body;

    const pool = await connectDB();
    await pool
      .request()
      .input('VoterID', sql.Int, id)
      .input('FirstName', sql.VarChar, FirstName)
      .input('SecondName', sql.VarChar, SecondName)
      .input('Email', sql.VarChar, Email)
      .input('PhoneNumber', sql.VarChar, PhoneNumber)
      .query(
        'UPDATE Voters SET FirstName = @FirstName, SecondName = @SecondName, Email = @Email, PhoneNumber = @PhoneNumber WHERE VoterID = @VoterID'
      );

    res.status(200).json({ message: 'Voter updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getVoters = async (req, res, next) => {
  try {
    const { searchQuery } = req.query;
    const pool = await connectDB();
    let query = 'SELECT * FROM Voters';
    
    // Add search condition if searchQuery is provided
    if (searchQuery) {
      query += ` WHERE FirstName LIKE '%${searchQuery}%' OR SecondName LIKE '%${searchQuery}%'`;
    }

    const result = await pool.request().query(query);
    const voters = result.recordset;
    res.status(200).json(voters);
  } catch (error) {
    next(error);
  }
};

