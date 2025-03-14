const OpenAI = require("openai");
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const PORT = 4000;

const app = express();

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

const openai = new OpenAI();

// Helper function to extract token from cookies
function getTokenFromCookie(req) {
  const token = req.cookies.auth_token;
  const decoded = jwt.verify(token, JWT_SECRET);

  // Access data from the decoded payload
  const { username, userId, canvasToken } = decoded;

  return canvasToken;
}

app.get('/api/users/user-details', async (req, res) => {
  const apiToken = req.query.token ? req.query.token : getTokenFromCookie(req);
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
    const response = await axios.get('https://canvas.instructure.com/api/v1/courses', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
      params: {
        'enrollment_state': 'active',
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

    // Request for all assignments under a course
    const assignmentResponse = await axios.get(`https://canvas.instructure.com/api/v1/courses/${courseId}/assignments`, {
      headers: { 'Authorization': `Bearer ${apiToken}`, },
      params: {
        include: ['rubric', 'score_statistics'], 
      },
    });
    const assignments = assignmentResponse.data.map((assignment) => ({
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

    const { userId } = req.body;
    const response = await axios.get(`https://canvas.instructure.com/api/v1/users/${userId}/enrollments`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    // Return detailed error message
    res.status(error.response?.status || 500).json({
      message: 'Error getting role',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/user/to-do', async (req, res) => {
  try {
    const apiToken = getTokenFromCookie(req);
    const response = await axios.get(`https://canvas.instructure.com/api/v1/users/self/todo`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });
    const filteredData = response.data.map(item => ({
      course_id: item.course_id,
      context_name: item.context_name,
      assignment: item.assignment
        ? {
            id: item.assignment.id,
            due_at: item.assignment.due_at,
            name: item.assignment.name,
            html_url: item.assignment.html_url,
            rubric: item.assignment.rubric || [], // Ensure rubric exists even if empty
          }
        : null, // If no assignment, return null
    }));
    res.json(filteredData);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: 'Error getting todo',
      details: error.response?.data || error.message,
    });
  }
});

app.post('/generate-questions', async (req, res) => {
  const { content, num_answers = 4, num_questions = 25 } = req.body;
  console.log("num_questions:", num_questions, "num_answers:", num_answers);
  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `Generate exactly ${num_questions} multiple choice questions based on the provided content. Each question should have exactly ${num_answers} answer options with exactly one correct answer. The questions should progressively increase in difficulty.`
        },
        { role: "user", content: content }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "QuestionResponse",
          description: `A set of ${num_questions} multiple choice questions, each with ${num_answers} possible answers`,
          schema: {
            type: "object",
            description: "Container for questions array",
            properties: {
              questions: {
                type: "array", 
                description: `Array of exactly ${num_questions} multiple choice questions`,
                items: {
                  type: "object",
                  description: "A single multiple choice question",
                  properties: {
                    question: { 
                      type: "string",
                      description: "The question text"
                    },
                    answers: {
                      type: "array",
                      description: `Array of exactly ${num_answers} possible answers, with exactly one correct answer`,
                      items: {
                        type: "object",
                        description: "A possible answer",
                        properties: {
                          text: { 
                            type: "string",
                            description: "The answer text"
                          },
                          isCorrect: { 
                            type: "boolean",
                            description: "Whether this is the correct answer"
                          }
                        },
                        required: ["text", "isCorrect"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["question", "answers"],
                  additionalProperties: false
                }
              }
            },
            required: ["questions"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });
    
    const questions = response.choices[0].message.parsed;
    
    // Validate number of questions and answers
    if (questions.questions.length < num_questions) {
      throw new Error(`Expected ${num_questions} questions but got ${questions.questions.length}`);
    }
     
    for (let i = 0; i < questions.questions.length; i++) {
      if (questions.questions[i].answers.length !== num_answers) {
        throw new Error(`Question ${i + 1} has ${questions.questions[i].answers.length} answers instead of ${num_answers}`);
      }
      
      // Validate exactly one correct answer per question
      const correctAnswers = questions.questions[i].answers.filter(a => a.isCorrect).length;
      if (correctAnswers !== 1) {
        throw new Error(`Question ${i + 1} has ${correctAnswers} correct answers instead of 1`);
      }
    }

    console.log("Generated questions count:", questions.questions.length);
    res.json(questions);
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/teacher-profile-agg/:courseId', async (req, res) => {
  const { courseId } = req.params;
  if (!courseId) {
    return res.status(400).json({
      message: "Missing required query parameter: courseId",
    });
  }

  const query = `
    query courseDetails($courseId: ID!) {
      course(id: $courseId) {
        _id
        enrollmentsConnection {
          nodes {
            type
            user {
              name
              _id
            }
          }
        }
        assignmentsConnection {
          nodes {
            _id
            name
          }
        }
      }
    }
  `;
  const variables = { courseId };

  try {
    const apiToken = getTokenFromCookie(req); // get token from browser cookie

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
});

app.get('/protected-route', (req, res) => {
  const token = req.cookies.auth_token;
  const decoded = jwt.verify(token, JWT_SECRET);
  const { username, userId, canvasToken } = decoded;

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
    res.json({ username, userId, canvasToken });
  } catch (err) {
    console.error('Invalid token:', err.message);
    res.status(401).send('Unauthorized: Invalid token');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
