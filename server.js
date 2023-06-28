import express from 'express';
import config from './src/Model/config.js';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import routes from './src/Routes/routes.js';
import { errorHandler } from './src/Utils/errorHandler.js';
import { connectDB, closeDB } from './src/Utils/database.js';
import bodyParser from 'body-parser';

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// Database middleware
app.use(async (req, res, next) => {
  try {
    // Connect to the database
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// JWT Middleware
app.use((req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'JWT'
  ) {
    jwt.verify(
      req.headers.authorization.split(' ')[1],
      config.jwt_secret,
      (err, decode) => {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});


// Routes
routes(app);

// Error handler middleware
app.use(errorHandler);

// Close database connection on server shutdown
process.on('SIGINT', async () => {
  try {
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('Failed to close the database connection.');
    process.exit(1);
  }
});

app.listen(config.port || 8085 , () => {
  console.log("Server is up and running");
});
