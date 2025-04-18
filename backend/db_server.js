require('dotenv').config();
// const { domain } = require('./const');
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');  // To parse cookies
const cors = require('cors');
const axios = require('axios');

const app = express();
const domain = new URL(process.env.API_BASE_URL).hostname;

app.use(cors({
    origin: true, 
    methods: ['GET', 'POST'],        // Allow specific methods
    credentials: true, // Enable cookies
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers
}));
app.use(express.json());
app.use(cookieParser());

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET;

// Configure your database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to RDS database.');
  connection.release();
});

async function updateStoredCanvasToken(username, newToken) {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE Account_Info SET canvas_token = ? WHERE username = ?';
    db.query(query, [newToken, username], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Route to handle signup
app.post('/signup', async (req, res) => {
    const { username, password, canvasToken, refreshToken } = req.body;

    if (!username || !password || !canvasToken || !refreshToken) {
        return res.status(400).json({ message: 'Username, password, canvas token, and refresh token are required' });
    }

    try {
      const userResponse = await axios.get(`http://${domain}:4000/api/users/user-details`, {
          params: {
              token: canvasToken,
          },
      });
      const teacherCanvasId = userResponse.data.id;
      const query = `
        INSERT INTO Account_Info (account_id, username, password, canvas_token, refresh_token) 
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(query, [teacherCanvasId, username, password, canvasToken, refreshToken], async (err, result) => {
        if (err) {
          console.error('Error inserting into Account_Info:', err);
          return res.status(500).json({ message: 'Database error' });
        }
      });

      // Set JWT token as an HTTP-only cookie
      const token = jwt.sign({ username: username, userId: teacherCanvasId, canvasToken: canvasToken }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('auth_token', token, {
        httpOnly: false,
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

  try {
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM Account_Info WHERE username = ?', [username], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!user || password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    try {
      const tokenResponse = await axios.post(`https://cbsd.instructure.com/login/oauth2/token`, null, {
        params: {
          grant_type: 'refresh_token',
          client_id: process.env.CANVAS_CLIENT_ID,
          client_secret: process.env.CANVAS_CLIENT_SECRET,
          refresh_token: user.refresh_token
        }
      });

      const { access_token } = tokenResponse.data;
      
      // Update the stored token
      await updateStoredCanvasToken(username, access_token);

      // Get user details with new token
      const userResponse = await axios.get(`http://${domain}:4000/api/users/user-details`, {
        params: { token: access_token }
      });
      
      const userId = userResponse.data.id;

      // Create JWT
      const token = jwt.sign(
        { username: user.username, userId, canvasToken: access_token },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('auth_token', token, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600000,
      });

      return res.json({
        username: user.username,
        userId,
        message: 'Login successful!'
      });
    } catch (error) {
      // If refresh token fails, we might need to redirect to Canvas login
      console.error('Token refresh failed:', error);
      return res.status(401).json({ 
        message: 'Session expired. Please log in to Canvas again.',
        needsCanvasAuth: true 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

  // Query the database to find the user by username
//   db.query('SELECT * FROM Account_Info WHERE username = ?', [username], async (err, results) => {
//     if (err) {
//       return res.status(500).json({ message: 'Database error' });
//     }

//     // If no user found, return an error
//     if (results.length === 0) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
    
//     // Compare entered password with the stored hashed password
//     const user = results[0];
//     if (password == user.password) {
//       try {
//         const userResponse = await axios.get(`http://${domain}:4000/api/users/user-details`, {
//             params: { token: user.canvas_token, },
//         });
//         const userId = userResponse.data.id;

//         // Set up cookie
//         const token = jwt.sign({ username: user.username, userId: userId, canvasToken: user.canvas_token }, JWT_SECRET, { expiresIn: '1h' });
//         // Set JWT token as an HTTP-only cookie
//         res.cookie('auth_token', token, {
//           httpOnly: false,
//           secure: false,
//           sameSite: 'lax',  // Prevent CSRF
//           maxAge: 3600000,  // 1 hour
//         });

//         return res.json({ 
//           username: user.username,
//           userId: userId,
//           message: 'Login successful!', 
//           });
//       } catch (error) {
//         console.log(error);
//       }
      
//     } else {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//   });
// });

app.post('/add-goal', async (req, res) => {
  const { goal_title, description, deadline, account_id } = req.body;
  if (!goal_title || !account_id) {
    return res.status(400).json({ message: 'goal_title and account_id are required' });
  }

  try {
    const query = `
      INSERT INTO Goals (account_id, goal_title, description, deadline) 
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [account_id, goal_title, description, deadline], async (err, result) => {
      if (err) {
        console.error('Error inserting into Goals:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      return res.status(201).json({
        message: 'Goal added successfully',
      });
    });
  } catch (error) {
    console.error('Error adding goal to database: ', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to add goal to databse' });
  }
});

app.get('/get-goals', async (req, res) => {
  const { account_id } = req.query;
  if (!account_id) {
    return res.status(400).json({ message: 'account_id is required' });
  }

  try {
    const query = `SELECT * FROM Goals WHERE account_id = ?`;
    db.query(query, [account_id], (err, results) => {
      if (err) {
        console.error('Error fetching from Goals:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching goals from database: ', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to fetch goals from database' });
  }
})

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


app.post('/update-goal', (req, res) => {
  const { goalId, completed } = req.body;
  if (!goalId) {
    return res.status(400).json({ message: "goalId is required" });
  }
  const query = `UPDATE Goals SET completed = ? WHERE goal_id = ?`;
  db.query(query, [completed, goalId], (err, result) => {
    if (err) {
      console.error("Error updating goal:", err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json({ message: "Goal updated successfully" });
  });
});

app.get('/get-games', async (req, res) => {
  const { course_ids } = req.query;
  try {
    let courseIdsArray = course_ids.split(',');
    if (courseIdsArray.length === 0) {
      return res.status(400).json({ message: "Invalid course_ids parameter" });
    }
    const placeholders = courseIdsArray.map(() => '?').join(', ');
    const query = `SELECT * FROM Games WHERE course_id IN (${placeholders})`;
    db.query(query, courseIdsArray, (err, results) => {
      if (err) {
        console.error('Error fetching from Games:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching goals from database: ', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to fetch goals from database' });
  }
});

app.get('/get-games-played', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) {
    return res.status(400).json({ message: 'student_id is required' });
  }

  try {
    const query = `SELECT COUNT(DISTINCT game_id) AS games_played
                   FROM GameResults
                   WHERE student_id = ?
                   GROUP BY student_id;`;
    db.query(query, [student_id], (err, results) => {
      if (err) {
        console.error('Error fetching from GameResults:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching games played from database: ', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to fetch games played from database' });
  }
})

app.get('/get-class-games-results', (req, res) => {
  const { course_id } = req.query;
  try {
    const query = `
    SELECT g.game_id, g.name, g.type, COUNT(gr.student_id) AS number_of_attempts,
      AVG(gr.score) AS average_score, MIN(gr.score) AS min_score, 
      MAX(gr.score) AS max_score
    FROM Games g
    INNER JOIN GameResults gr ON g.game_id = gr.game_id
    WHERE g.course_id = ?
    GROUP BY g.game_id, g.name, g.type
    ORDER BY g.game_id;
    `;
    db.query(query, [course_id], (err, results) => {
      if (err) {
        console.error('Error fetching from Games:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      const game_ids = results.map(game => game.game_id);
      const game_names = results.map(game => game.name);
      const average_scores = results.map(game => game.average_score);
      return res.status(200).json({ game_ids, game_names, average_scores });
    });
  } catch (error) {
    console.error('Error fetching goals from database: ', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to fetch goals from database' });
  }
});

app.get('/get-student-games-results', (req, res) => {
  const { course_id } = req.query;
  try {
    const query = `
    SELECT g.game_id, g.name, g.type, gr.student_id, 
       COUNT(gr.result_id) AS attempts,
       AVG(gr.score) AS average_score,
       MAX(gr.score) AS best_score,
       MIN(gr.time_played) AS first_attempt,
       MAX(gr.time_played) AS latest_attempt
    FROM Games g
    INNER JOIN GameResults gr ON g.game_id = gr.game_id
    WHERE g.course_id = ?
    GROUP BY g.game_id, g.name, g.type, gr.student_id
    ORDER BY g.game_id, gr.student_id;
    `;
    db.query(query, [course_id], (err, results) => {
      if (err) {
        console.error('Error fetching from Games:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      const game_ids = results.map(game => game.game_id);
      const game_names = results.map(game => game.name);
      const student_ids = results.map(game => game.student_id);
      const average_scores = results.map(game => game.average_score);
      return res.status(200).json({ game_ids, game_names, student_ids, average_scores });
    });
  } catch (error) {
    console.error('Error fetching goals from database: ', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to fetch goals from database' });
  }
});

app.post('/add-game-result', (req, res) => {
  const { game_id, student_id, score, user_name } = req.body;
  if (!game_id || !student_id || score == null) {
    return res.status(400).json({ message: "game_id, student_id, and score are all required" });
  }

  const numericGameId = Number(game_id);
  const numericStudentId = Number(student_id);
  const numericScore = Number(score);

  console.log("game_id:", numericGameId, "student_id:", numericStudentId, 
              "score:", numericScore, "user_name:", user_name);
  
  // First check if student exists
  const checkStudentQuery = `SELECT student_id FROM Students WHERE student_id = ?`;
  db.query(checkStudentQuery, [numericStudentId], (checkErr, students) => {
    if (checkErr) {
      console.error("Error checking student:", checkErr);
      return res.status(500).json({ message: "Database error while checking student" });
    }
    
    // If student doesn't exist, insert them first
    if (students.length === 0) {      
      const studentName = req.body.user_name || `Student ${numericStudentId}`;
      
      const insertStudentQuery = `INSERT INTO Students (student_id, name) VALUES (?, ?)`;
      
      db.query(insertStudentQuery, [numericStudentId, studentName], (insertErr) => {
        if (insertErr) {
          console.error("Error inserting student:", insertErr);
          return res.status(500).json({ message: "Database error while inserting student" });
        }
        
        // Now save the game result
        saveGameResult();
      });
    } else {
      // Student exists, just save the game result
      saveGameResult();
    }
  });
  
  function saveGameResult() {
    const query = `INSERT INTO GameResults (game_id, student_id, score) VALUES (?, ?, ?)`;
    db.query(query, [numericGameId, numericStudentId, numericScore], (err, result) => {
      if (err) {
        console.error("Error updating game results:", err);
        return res.status(500).json({ message: "Database error" });
      }
      return res.status(200).json({ 
        message: "Game results updated successfully",
        result_id: result.insertId,
      });
    });
  }
});

app.post('/add-game', (req, res) => {
  const { name, type, course_id } = req.body;
  if (!name || !type || !course_id) {
    return res.status(400).json({ message: "name, type, and course_id are all required" });
  }
  const query = `INSERT INTO Games (name, type, course_id) VALUES (?, ?, ?)`;
  db.query(query, [name, type, course_id], (err, result) => {
    if (err) {
      console.error("Error updating games:", err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json({ 
      message: "Games updated successfully",
      game_id: result.insertId,
    });
  });
});

app.post('/add-questions-answers', (req, res) => {
  const { game_id, questions: questionData } = req.body;

  if (!game_id || !questionData || !Array.isArray(questionData.questions) || questionData.questions.length === 0) {
    return res.status(400).json({ error: "Missing or invalid game_id/questions" });
  }

  db.beginTransaction(async (err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Database transaction error" });
    }

    try {
      for (const q of questionData.questions) {
        // Insert question
        const [questionResult] = await db.promise().execute(
          `INSERT INTO Questions (text, game_id) VALUES (?, ?)`,
          [q.question, game_id]
        );

        const questionId = questionResult.insertId; // Get the inserted question ID

        // Insert answers for the question
        for (const ans of q.answers) {
          await db.promise().execute(
            `INSERT INTO Answers (text, is_correct, question_id) VALUES (?, ?, ?)`,
            [ans.text, ans.isCorrect ? 1 : 0, questionId] // Convert true/false to 1/0
          );
        }
      }

      db.commit((commitErr) => {
        if (commitErr) {
          console.error("Commit error:", commitErr);
          return res.status(500).json({ error: "Failed to commit transaction" });
        }
        res.json({ message: "Questions and answers stored successfully!" });
      });

    } catch (error) {
      db.rollback(() => console.error("Transaction rolled back due to error:", error));
      res.status(500).json({ error: "Error inserting questions and answers" });
    }
  });
});

app.get('/get-questions-answers', async (req, res) => {
  const { game_id } = req.query;
  if (!game_id) {
    return res.status(400).json({ error: "Missing game_id" });
  }
  try {
    const query = `
      SELECT q.question_id, q.text as question_text, a.answer_id, a.text as answer_text, a.is_correct
      FROM Questions q
      JOIN Answers a ON q.question_id = a.question_id
      WHERE q.game_id = ?
    `;
    db.query(query, [game_id], (err, results) => {
      if (err) {
        console.error("Error fetching questions:", err);
        return res.status(500).json({ error: "Database error" });
      }
  
      const formattedData = {};
      results.forEach(row => {
        if (!formattedData[row.question_id]) {
          formattedData[row.question_id] = {
            question: row.question_text,
            answers: [],
          };
        }
        formattedData[row.question_id].answers.push({
          text: row.answer_text,
          isCorrect: row.is_correct === 1
        });
      });
  
      res.json({ questions: Object.values(formattedData) });
    });
  } catch (error) {
    console.error('Error fetching goals from database: ', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to fetch goals from database' });
  }
})
