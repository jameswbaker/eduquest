const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const PORT = 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001'],  // Frontend URL
  methods: ['GET', 'POST'],        // Allow specific methods
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers
}));
app.use(cookieParser());

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to extract token from cookies
function getTokenFromCookie(req) {
  const token = req.cookies.auth_token;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.canvasToken; // Canvas API token
}

// Define the GraphQL schema
const schema = buildSchema(`
  type Assignment {
    id: Int
    name: String
    rubric: String
    score_statistics: String
  }

  type UserDetails {
    id: Int
  }

  type Course {
    course_name: String
    course_code: String
    account_id: Int
    total_students: Int
    assignments: [Assignment]
  }

  type Query {
    userDetails(token: String!): UserDetails
    courses: [String]
    courseDetails(courseId: Int!): Course
  }
`);

// Define the GraphQL resolvers
const root = {
  userDetails: async ({ token }) => {
    try {
      const response = await axios.get('https://canvas.instructure.com/api/v1/users/self', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  },
  courses: async (args, context) => {
    try {
      const apiToken = getTokenFromCookie(context.req);
      const response = await axios.get('https://canvas.instructure.com/api/v1/users/self/courses', {
        headers: { 'Authorization': `Bearer ${apiToken}` },
      });
      return response.data.map(course => course.name); // Return list of course names
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  },
  courseDetails: async ({ courseId }, context) => {
    try {
      const apiToken = getTokenFromCookie(context.req);
      const courseResponse = await axios.get(`https://canvas.instructure.com/api/v1/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${apiToken}` },
      });

      const assignmentResponse = await axios.get(`https://canvas.instructure.com/api/v1/courses/${courseId}/assignments`, {
        headers: { 'Authorization': `Bearer ${apiToken}` },
        params: { include: ['rubric', 'score_statistics'] },
      });

      return {
        course_name: courseResponse.data.name,
        course_code: courseResponse.data.course_code,
        account_id: courseResponse.data.account_id,
        total_students: courseResponse.data.total_students,
        assignments: assignmentResponse.data.map(assignment => ({
          id: assignment.id,
          name: assignment.name,
          rubric: assignment.rubric || null,
          score_statistics: assignment.score_statistics || null,
        })),
      };
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  },
};

// Add the GraphQL endpoint
app.use('/', graphqlHTTP((req) => ({
  schema: schema,
  rootValue: root,
  context: { req }, // Pass request to context for token extraction
  graphiql: true,   // Enable GraphiQL for testing
})));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);
});
