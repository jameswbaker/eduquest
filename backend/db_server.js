const express = require('express');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');  // To securely compare passwords
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');  // To parse cookies
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:4000'],  // Frontend URL
    methods: ['GET', 'POST'],        // Allow specific methods
    credentials: true, // Enable cookies
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers
}));
app.use(express.json());
app.use(cookieParser());

require('dotenv').config();

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET;

// Configure your database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to RDS database.');
});

// Route to handle signup
app.post('/signup', async (req, res) => {
    const { username, password, canvasToken } = req.body;

    if (!username || !password || !canvasToken) {
        return res.status(400).json({ message: 'Username, password, and canvas token are required' });
    }

    try {
      const userResponse = await axios.get('http://localhost:4000/api/users/user-details', {
          params: {
              token: canvasToken,
          },
      });
      // const userResponse = await axios.post('http://localhost:4000/api/users/user-details', {
      //   query: `
      //     query {
      //       userDetails(token: "${canvasToken}") {
      //         id
      //       }
      //     }
      //   `
      // });
      // const teacherCanvasId = userResponse.data.data.userDetails.id;
      const teacherCanvasId = userResponse.data.id;
      console.log('Teacher Canvas User ID: ', teacherCanvasId);

      const query = `
        INSERT INTO Account_Info (account_id, username, password, canvas_token) 
        VALUES (?, ?, ?, ?)
      `;
      db.query(query, [teacherCanvasId, username, password, canvasToken], async (err, result) => {
        if (err) {
          console.error('Error inserting into Account_Info:', err);
          return res.status(500).json({ message: 'Database error' });
        }
      });

      // Set JWT token as an HTTP-only cookie
      const token = jwt.sign({ username: username, userId: teacherCanvasId, canvasToken: canvasToken }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('auth_token', token, {
        httpOnly: false,
        // secure: process.env.NODE_ENV === 'production',  // Secure only in HTTPS
        secure: false,
        sameSite: 'lax',  // Prevent CSRF
        maxAge: 3600000,  // 1 hour
      });

      return res.status(201).json({
        message: 'User created successfully, all courses imported!',
        userId: teacherCanvasId,
      });
    } catch (error) {
      console.error('Error fetching user from Canvas: ', error.response?.data || error.message);
      return res.status(500).json({ message: 'Failed to fetch user info from Canvas' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Query the database to find the user by username
    db.query('SELECT * FROM Account_Info WHERE username = ?', [username], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // If no user found, return an error
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
  
      // Compare entered password with the stored hashed password
      const user = results[0];
      if (password == user.password) {
        const token = jwt.sign({ username: user.username, userId: user.id, canvasToken: user.canvas_token }, JWT_SECRET, { expiresIn: '1h' });

        // Set JWT token as an HTTP-only cookie
        res.cookie('auth_token', token, {
          httpOnly: false,
          // secure: process.env.NODE_ENV === 'production',  // Secure only in HTTPS
          secure: false,
          sameSite: 'lax',  // Prevent CSRF
          maxAge: 3600000,  // 1 hour
        });

        try {

          const userResponse = await axios.get('http://localhost:4000/api/users/user-details', {
              params: {
                  token: user.canvas_token,
              },
          });
          const teacherCanvasId = userResponse.data.id;
          
          const userId = teacherCanvasId;

          console.log("HELLO");

          return res.json({ 
            userId: userId,
            message: 'Login successful!', 
            });
        } catch (error) {
          console.log(error);
        }
        
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    });
  });

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/store-course', (req, res) => {
  const {
    course_id,
    name,
    canvas_account_id,
    local_account_id,
  } = req.body;
});
