const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors()); // Enable CORS for all routes

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
    console.log(response.data);
    res.json(response.data); // Return the user data
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: 'Error fetching courses',
      details: error.response?.data || error.message,
    });
  }
});

// Route to fetch courses from Canvas API
app.get('/api/courses', async (req, res) => {
  const apiToken = req.query.token; // Get API token from query parameters
  console.log(apiToken);
  try {
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
  const apiToken = req.query.token; // Get API token from query parameters
  
  try {
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

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
