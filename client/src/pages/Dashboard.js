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

  // Fetch to-do items from API
  const fetchTodos = async () => {
    setError("");
    try {
      const response = await axios.get("http://localhost:4000/api/user/to-do", {
        withCredentials: true,
      });
      setTodos(response.data);
      console.log("Todos fetched:", response.data);
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
          <h2>To-do List</h2>
          <div className="todo-list">
            {todos.length > 0 ? (
              todos.map((todo) => (
                <ToDoCard
                  key={todo.id}
                  taskName={todo.taskName || todo.course_id}
                  dueDate={todo.dueDate || "No Due Date"}
                  color={todo.color || "yellow"}
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

const ToDoCard = ({ taskName, dueDate, color }) => (
  <div className={`course-card ${color}`}>
    <div className={`todo-color-section ${color}`}></div>
    <div className="todo-text-section">
      <h3>{taskName}</h3>
      <p>{dueDate}</p>
    </div>
  </div>
);

export default Dashboard;
