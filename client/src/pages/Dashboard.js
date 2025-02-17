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

  const handleTeacherView = () => {
    // const idToNavigate = 0;  
    navigate(`/teacherBoard`);
  };

  useEffect(() => {
    const currUser = ReactSession.get("user");
    setUser(currUser);
    console.log("User is:", user);
    if (!currUser) {
      alert("Please log in first");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchCourses();
  }, []);

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

  // Cycle through colors for the course cards
  const colorOrder = ["yellow", "blue", "red", "pink", "green"];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>{user.username} Dashboard</h1>
        <div className="header-icons">
        <button className="t-icon-button" onClick={handleTeacherView}>
            Teacher View
          </button>
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
            <ToDoCard
              taskName="Understanding Romantic Gothic"
              dueDate="Due Nov 10"
              color="yellow"
            />
            <ToDoCard
              taskName="Haiku"
              dueDate="No Due Date"
              color="yellow"
            />
            <ToDoCard
              taskName="Problem-Solution Essay Writing"
              dueDate="Due Dec 12"
              color="red"
            />
            <ToDoCard
              taskName="White Paper"
              dueDate="Due Oct 12 Finished Oct 10"
              color="green"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ courseName, instructor, color, courseId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dataDashboard/${courseId}`);
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
