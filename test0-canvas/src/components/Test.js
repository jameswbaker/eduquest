import React, { useState } from 'react';
import axios from 'axios';

function Test() {
  const [apiToken, setApiToken] = useState('');   // Store API token
  const [courses, setCourses] = useState([]);     // Store courses data
  const [students, setStudents] = useState([]);   // Store students data
  const [grades, setGrades] = useState([]);       // Store grades data
  const [error, setError] = useState('');         // Store any errors

  // Handle API token input change
  const handleTokenChange = (e) => {
    setApiToken(e.target.value);
  };

  // Fetch courses from Canvas API
  const fetchCourses = async () => {
    setError('');  // Reset error state
    try {
      const response = await axios.get('http://localhost:4000/api/courses', {
        params: { token: apiToken }, // Pass the API token as a query parameter
      });
      setCourses(response.data); // Store the fetched courses
    } catch (error) {
      console.error('Error fetching courses:', error.response ? error.response.data : error.message);
      setError('Error fetching courses. Please check your token and permissions.');
    }
  };
  
  // Fetch assignments, given a course, from Canvas API
  const fetchAssignments = async (courseId) => {
    setError('');  // Reset error state
    try {
      const response = await axios.get(`http://localhost:4000/api/courses/${courseId}/assignments`, {
        params: { token: apiToken }, // Pass the API token as a query parameter
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error.response ? error.response.data : error.message);
      setError('Error fetching assignments. Please check your token and permissions.');
    }
  };

  // Given an assignment and a course, fetch the grading and submission data
  const fetchAssignmentData = async (courseId, assignmentId) => {
    setError('');  // Reset error state
    try {
      const response = await axios.get(`http://localhost:4000/api/courses/${courseId}/assignments/${assignmentId}`, {
        params: { token: apiToken }, // Pass the API token as a query parameter
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching assignment data:', error.response ? error.response.data : error.message);
      setError('Error fetching assignment data. Please check your token and permissions.');
    }
  };

  /*
  1. Input your API Token -> fetch courses
  2. Select a specific course -> fetch assignments
  */

  /*
  Input your API token.
  Retrieve all students.
  For each student, show their grades for each assignment.
  */
  const fetchStudents = async (courseId) => {
    setError('');  // Reset error state
    try {
      const response = await axios.get(`http://localhost:4000/api/courses/${courseId}/students`, {
        params: { token: apiToken }, // Pass the API token as a query parameter
      });
      setStudents(response.data); // Store the fetched students
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching students:', error.response ? error.response.data : error.message);
      setError('Error fetching students. Please check your token and permissions.');
    }
  };

  return (
    /*
    User should input their API token.
    This will display a list of courses they can click on.
    If they click on a course, it will display all the students in that course.
    For each student, show a table of their grades for each assignment.
    */
    <div>
      <h1>Canvas API Proxy</h1>
      <div>
        <label>
          API Token:
          <input type="text" value={apiToken} onChange={handleTokenChange} />
        </label>
        <button onClick={fetchCourses}>Fetch Courses</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <h2>Courses</h2>
        <ul>
          {courses.map((course) => (
            <li key={course.id}>
              {course.name} - <button onClick={() => fetchStudents(course.id)}>View Students</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Students</h2>
        <ul>
          // For each student object, access its grades using student.grades. display the grade
          // parse the object
          {students.map((student) => (
            <li key={student.id}>
              {student.user.name} got {student.grades.final_score}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Test;
