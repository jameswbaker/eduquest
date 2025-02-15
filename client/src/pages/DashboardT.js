import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSession } from "react-client-session";
import axios from "axios"; // Same as in TeacherDashboardPage
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();


  useEffect(() => {
    const user = ReactSession.get('user');
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate('/'); 
    }
  }, [navigate]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  // Fetch courses from Canvas API (REST) on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setError(""); // reset error before fetching
    try {
      const response = await axios.get("http://localhost:4000/api/courses", {
        withCredentials: true,
      });
      setCourses(response.data); // store the fetched courses
    } catch (error) {
      console.error(
        "Error fetching courses:",
        error.response ? error.response.data : error.message
      );
      setError("Error fetching courses. Please check your token and permissions.");
    }
  };

  // Color cycle array
  const colorOrder = ["yellow", "blue", "red", "pink", "green"];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Chanya's Dashboard</h1>
        <div className="header-icons">
          <span className="icon">💬</span>
          <span className="icon">🛒</span>
          <span className="icon">⚪</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Courses Section */}
        <div className="courses-section">
          <h2>Courses</h2>
          {/* Show error (if any) */}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="courses-list">
            {/* Dynamically render courses */}
            {courses.map((course, index) => {
              // pick color based on index modulo the length of colorOrder
              const color = colorOrder[index % colorOrder.length];

              return (
                <CourseCard
                  key={course.id}
                  courseName={course.name}
                  // If you have an instructor field from your API, replace "Unknown Instructor" with it
                  instructor="Unknown Instructor"
                  color={color}
                  courseId={course.id}
                />
              );
            })}
          </div>
        </div>

        {/* To-Do List Section (example static content) */}
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
    // Example: navigate to a data dashboard page
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
