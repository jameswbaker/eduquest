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
app.use(express.json());

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; // Ensure this matches the secret used for signing

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

app.get('/api/users/user-details', async (req, res) => {
  // console.log("GOT HERE");
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

app.get('/api/example/:courseId', async (req, res) => {

  const { courseId } = req.params;
  if (!courseId) {
    return res.status(400).json({
      message: "Missing required query parameters: token or courseId",
    });
  }

  const query = `
    query courseDetails($courseId: ID!) {
      course(id: $courseId) {
        id
        name
      }
    }
  `;
  const variables = { courseId };

  try {
    const apiToken = getTokenFromCookie(req); // get token from browser cookie

    console.log("API TOKEN: ", apiToken);

    // Make a request to Canvas API to get enrollments and filter by 'StudentEnrollment'
    const graphqlResponse = await axios.post(`https://canvas.instructure.com/api/graphql`, 
      {
        query,
        variables
      },
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Result of GQL is: " + JSON.stringify(graphqlResponse.data.data));
    const course_id = graphqlResponse.data.data.course.id;
    const name = graphqlResponse.data.data.course.name;
    // console.log("GQL id: " + course_id);
    // console.log("GQL name: " + name);

    res.json({
      course_id,
      name
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: 'Error fetching GQL course details',
      details: error.response?.data || error.message,
    });
  }
})

app.get('/api/course-details-agg/:courseId', async (req, res) => {

  const { courseId } = req.params;
  if (!courseId) {
    return res.status(400).json({
      message: "Missing required query parameters: token or courseId",
    });
  }

  const query = `
    query courseDetails($courseId: ID!) {
      course(id: $courseId) {
        id
        name
        submissionsConnection {
          edges {
            node {
              _id
              assignmentId
              grade
              assignment {
                description
                name
                id
                pointsPossible
                submissionsConnection {
                  edges {
                    node {
                      id
                      score
                      rubricAssessmentsConnection {
                        nodes {
                          _id
                          assessmentRatings {
                            description
                            points
                            criterion {
                              description
                              _id
                            }
                          }
                        }
                      }
                      userId
                    }
                  }
                }
                rubric {
                  criteria {
                    points
                    _id
                    description
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const variables = { courseId };

  try {
    const apiToken = getTokenFromCookie(req); // get token from browser cookie

    console.log("API TOKEN: ", apiToken);

    // Make a request to Canvas API to get enrollments and filter by 'StudentEnrollment'
    const graphqlResponse = await axios.post(`https://canvas.instructure.com/api/graphql`, 
      {
        query,
        variables
      },
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Result of GQL is: " + JSON.stringify(graphqlResponse.data.data));
    // The entire "course" object from GraphQL:
    const course = graphqlResponse.data.data.course;

    // Just return it as JSON to the frontend:
    res.json(course);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: 'Error fetching GQL course details',
      details: error.response?.data || error.message,
    });
  }
})

app.get('/api/courses/:courseId/course-details', async (req, res) => {
  const { courseId } = req.params;
  if (!courseId) {
    return res.status(400).json({
      message: "Missing required query parameters: token or courseId",
    });
  }

  try {
    const apiToken = getTokenFromCookie(req); // get token from browser cookie

    // Make a request to Canvas API to get enrollments and filter by 'StudentEnrollment'
    const courseResponse = await axios.get(`https://canvas.instructure.com/api/v1/courses/${courseId}`, {
      headers: { 'Authorization': `Bearer ${apiToken}`, },
    });
    const course_name = courseResponse.data.name;
    const course_code = courseResponse.data.course_code;
    const account_id = courseResponse.data.account_id;
    // console.log(courseResponse.data);

    // Request for all assignments under a course
    const assignmentResponse = await axios.get(`https://canvas.instructure.com/api/v1/courses/${courseId}/assignments`, {
      headers: { 'Authorization': `Bearer ${apiToken}`, },
      params: {
        include: ['rubric', 'score_statistics'], 
      },
    });
    const assignments = assignmentResponse.data.map((assignment) => (
      // console.log("ASSIGNMENT RUBRIC:", assignment.rubric),
      // console.log("ASSIGNMENT SCORE_STATS:", assignment.score_statistics),
      {
      id: assignment.id,
      name: assignment.name,
      description: assignment.description,
      rubric: assignment.rubric,                // May only be present if Canvas provides it
      score_statistics: assignment.score_statistics, // May only be present with include[]=score_statistics
    }));

    res.json({
      course_name,
      course_code,
      account_id,
      assignments,
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

app.post('/api/get-role', async (req, res) => {
  try {
    const apiToken = getTokenFromCookie(req); // get token from browser cookie
    // Make a request to Canvas API to get enrollments and filter by 'StudentEnrollment'

    console.log("RESPONSE_ENROLLMENT: ", req.body);

    const { userId } = req.body;

    const response = await axios.get(`https://canvas.instructure.com/api/v1/users/${userId}/enrollments`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });

    console.log("RESPONSE_ENROLLMENT: ", response.data);

    res.json(response.data);
  } catch (error) {
    // Return detailed error message
    res.status(error.response?.status || 500).json({
      message: 'Error getting role',
      details: error.response?.data || error.message,
    });
  }
});


app.get('/protected-route', (req, res) => {
  const token = req.cookies.auth_token;

  const decoded = jwt.verify(token, JWT_SECRET);
    // console.log('Decoded payload:', decoded);

    // Access data from the decoded payload
    const { username, userId, canvasToken } = decoded;

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
    res.json({ message: `Hello, ${username}!`, userId, canvasToken });
  } catch (err) {
    console.error('Invalid token:', err.message);
    res.status(401).send('Unauthorized: Invalid token');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
