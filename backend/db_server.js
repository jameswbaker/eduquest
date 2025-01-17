const express = require('express');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');  // To securely compare passwords
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');  // To parse cookies
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',  // Frontend URL
    methods: ['GET', 'POST'],        // Allow specific methods
    credentials: true, // Enable cookies
}));
app.use(express.json());

require('dotenv').config();

// Secret key for JWT signing
const JWT_SECRET = '123456789';

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

// Define an API route to fetch data
app.get('/data', (req, res) => {
  const query = 'SELECT * FROM your_table';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Route to handle signup
app.post('/signup', (req, res) => {
    const { username, password, canvasToken } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const query = 'INSERT INTO Account_Info (username, password, canvas_token) VALUES (?, ?, ?)';
    db.query(query, [username, password, canvasToken], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'User created successfully' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Query the database to find the user by username
    db.query('SELECT * FROM Account_Info WHERE username = ?', [username], (err, results) => {

        // console.log(err);
        // console.log(results);

      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
  
    //   console.log(results.length);
      // If no user found, return an error
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Compare entered password with the stored hashed password
      const user = results[0];
      if (password == user.password) {
        const token = jwt.sign({ username: user.username, userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        // Set JWT token as an HTTP-only cookie
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',  // Secure only in HTTPS
          sameSite: 'Strict',  // Prevent CSRF
          maxAge: 3600000,  // 1 hour
        });

        return res.json({ message: 'Login successful!' });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    });
  });

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
