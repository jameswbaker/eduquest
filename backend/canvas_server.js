const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001'],  // Frontend URL
  methods: ['GET', 'POST'],        // Allow specific methods
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers
})); // Enable CORS for all routes
app.use(cookieParser());

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; // Ensure this matches the secret used for signing

app.get('/api/users/user-details', async (req, res) => {
  console.log("GOT HERE");
  const apiToken = req.query.token;
  if (!apiToken) {
    return res.status(400).json({
      message: "Missing required query parameters: token",
    });
  }
  try {
    const response = await axios.get('https://canvas.instructure.com/api/v1/users/self', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });
    res.json(response.data); // Return the user data
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: 'Error fetching user details',
      details: error.response?.data || error.message,
    });
  }
});

// Route to fetch courses from Canvas API
app.get('/api/courses', async (req, res) => {
  try {
    const apiToken = getTokenFromCookie(req); // get token from browser cookie
    const response = await axios.get('https://canvas.instructure.com/api/v1/users/self/courses', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });
    res.json(response.data); // Return the courses data
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: 'Error fetching courses',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/courses/course-details', async (req, res) => {
  const { token, courseId } = req.query;
  if (!token || !courseId) {
    return res.status(400).json({
      message: "Missing required query parameters: token or courseId",
    });
  }

  try {
    // Make a request to Canvas API to get enrollments and filter by 'StudentEnrollment'
    const response = await axios.get(`https://canvas.instructure.com/api/v1/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const { id, name, account_id } = response.data;
    res.json({
      course_id: id,
      name,
      account_id,
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: 'Error fetching course details',
      details: error.response?.data || error.message,
    });
  }
});

// Route to fetch students in a specific course
app.get('/api/courses/:courseId/students', async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const apiToken = getTokenFromCookie(req); // get token from browser cookie
    // Make a request to Canvas API to get enrollments and filter by 'StudentEnrollment'
    const response = await axios.get(`https://canvas.instructure.com/api/v1/courses/${courseId}/enrollments`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
      params: {
        type: 'StudentEnrollment', // Filter for students only
      },
    });

    // print out
    console.log(response.data);

    // Return only the student data
    res.json(response.data); 
  } catch (error) {
    // Return detailed error message
    res.status(error.response?.status || 500).json({
      message: 'Error fetching students',
      details: error.response?.data || error.message,
    });
  }
});


app.get('/protected-route', (req, res) => {
  const token = req.cookies.auth_token;

  const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded payload:', decoded);

    // Access data from the decoded payload
    const { username, userId, canvasToken } = decoded;

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
    // Verify and decode the token
    

    res.json({ message: `Hello, ${username}!`, userId, canvasToken });
  } catch (err) {
    console.error('Invalid token:', err.message);
    res.status(401).send('Unauthorized: Invalid token');
  }
});

// Helper function to extract token from cookies
function getTokenFromCookie(req) {
  const token = req.cookies.auth_token;
  console.log(token);
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log(decoded);

  // Access data from the decoded payload
  const { username, userId, canvasToken } = decoded;

  return canvasToken;
}

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
