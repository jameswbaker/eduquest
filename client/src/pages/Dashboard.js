// Dashboard.jsx

import React, { useState, useEffect } from "react";
import { ReactSession } from "react-client-session";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState("");
  const [studentName, setStudentName] = useState(""); // New state for full name
  const [todos, setTodos] = useState([]); // To-do items

  // Check if the user is logged in and fetch session info
  useEffect(() => {
    const currUser = ReactSession.get("user");
    setUser(currUser);
    console.log("User is:", currUser);
    if (!currUser) {
      alert("Please log in first");
      navigate("/");
    } else {
      // If a user exists, fetch the student's Canvas info for their full name
      fetchStudentCanvasInfo();
    }
  }, [navigate]);


  useEffect(() => {
    const enrollmentType = ReactSession.get("enrollmentType");
    console.log(enrollmentType);
      if (enrollmentType === "TeacherEnrollment") {
        alert("Not authorized to access teacher page");
        navigate('/teacherBoard');
      }
    }, [navigate]);
    

  useEffect(() => {
    fetchCourses();
    fetchTodos();
  }, []);

  // Fetch courses from API
  const fetchCourses = async () => {
    setError("");
    try {
      const response = await axios.get("http://localhost:4000/api/courses", {
        withCredentials: true,
      });
      setCourses(response.data);
    } catch (error) {
      console.error(
        "Error fetching courses:",
        error.response ? error.response.data : error.message
      );
      setError(
        "Error fetching courses. Please check your token and permissions."
      );
    }
  };

  function formatDate(isoString) {
    if (!isoString) return;
    const date = new Date(isoString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}-${day}-${year}`;
  }

  // Fetch to-do items from API
  const fetchTodos = async () => {
    setError("");
    try {
      const response = await axios.get("http://localhost:4000/api/user/to-do", {
        withCredentials: true,
      });
      const formattedTodos = response.data.map((todo, index) => ({
        todoId: todo.assignment?.id || index,
        contextName: todo.context_name, 
        assignmentName: todo.assignment?.name || "No assignment name",
        dueAt: todo.assignment?.due_at ? formatDate(todo.assignment.due_at) : "No due date",
        htmlUrl: todo.assignment?.html_url || "#",
      }));
      setTodos(formattedTodos);
      console.log("Todos fetched:", formattedTodos);
    } catch (error) {
      console.error(
        "Error fetching todos:",
        error.response ? error.response.data : error.message
      );
      setError("Error fetching todos. Please check your token and permissions.");
    }
  };

  // Fetch student info (full name) from Canvas API
  const fetchStudentCanvasInfo = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/users/user-details", {
        withCredentials: true,
      });
      setStudentName(response.data.name);
    } catch (error) {
      console.error(
        "Error fetching student canvas info:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Colors for course cards
  const colorOrder = ["yellow", "blue", "red", "pink", "green"];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>{studentName ? `${studentName}'s Dashboard` : "Dashboard"}</h1>
        <div className="header-icons">
          {/* Optional teacher view button can go here */}
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Courses Section */}
        <div className="courses-section">
          <h2>Courses</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="courses-list">
            {courses.map((course, index) => {
              const color = colorOrder[index % colorOrder.length];
              return (
                <CourseCard
                  key={course.id}
                  courseName={course.name}
                  instructor={course.instructor || "Unknown Instructor"}
                  color={color}
                  courseId={course.id}
                />
              );
            })}
          </div>
        </div>

        {/* To-Do List Section */}
        <div className="todo-section">
          <h2>Upcoming Assignments</h2>
          <div className="todo-list">
            {todos.length > 0 ? (
              todos.map(todo => (
                <ToDoCard
                  key={todo.todoId}
                  contextName={todo.contextName}
                  assignmentName={todo.assignmentName}
                  dueDate={todo.dueAt}
                  color={todo.color || "yellow"}
                  htmlUrl={todo.htmlUrl}
                />
              ))
            ) : (
              <p>No to-do items</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ courseName, instructor, color, courseId }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/courseDashboard/${courseId}`);
  };

  return (
    <div className={`course-card ${color}`} onClick={handleClick}>
      <div className={`color-section ${color}`}></div>
      <div className={`text-section ${color}`}>
        <h3>{courseName}</h3>
        <p>{instructor}</p>
      </div>
    </div>
  );
};

const ToDoCard = ({ contextName, assignmentName, dueDate, htmlUrl, color }) => (
  <a href={htmlUrl} target="_blank" rel="noopener noreferrer">
    <div className={`course-card ${color}`}>
      <div className={`todo-color-section ${color}`}></div>
      <div className="todo-text-section">
        <h3>{contextName}</h3>
        <p>{assignmentName}</p>
        <p><strong>Due:</strong> {dueDate}</p>
      </div>
    </div>
  </a>
);

export default Dashboard;
