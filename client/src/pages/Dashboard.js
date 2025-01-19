// App.jsx
import React from "react";
import "./Dashboard.css";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Chanya's Dashboard</h1>
        <div className="header-icons">
          <button className="icon-button">💬</button>
          <button className="icon-button">🛒</button>
          <button className="icon-button">⚪</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Courses Section */}
        <div className="courses-section">
          <h2>Courses</h2>
          <div className="courses-list">
            <CourseCard
              courseName="English 101"
              instructor="James Baker"
              color="yellow"
              courseId="1"
            />
            <CourseCard
              courseName="Poetry"
              instructor="Chanya Thanglerdsumpan"
              color="blue"
              courseId="2"
            />
            <CourseCard
              courseName="Spelling"
              instructor="Vivi Li"
              color="red"
              courseId="3"
            />
            <CourseCard
              courseName="Intersection of Art & English"
              instructor="Cindy Wei"
              color="pink"
              courseId="4"
            />
            <CourseCard
              courseName="Grammar"
              instructor="Avi"
              color="green"
              courseId="5"
            />
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
              border="black"
            />
            <ToDoCard
              taskName="Haiku"
              dueDate="No Due Date"
              color="yellow" // in-progress
              border="black"
            />
            <ToDoCard
              taskName="Problem-Solution Essay Writing"
              dueDate="Due Dec 12"
              color="red" // red is for not done
              border="black"
            />
            <ToDoCard
              taskName="White Paper"
              dueDate="Due Oct 12 Finished Oct 10"
              color="green" // completed
              border="black"
              courseId="5"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
};

const CourseCard = ({ courseName, instructor, color, courseId }) => {
  const navigate = useNavigate();  // Hook to navigate programmatically

  // Handler for clicking the card
  const handleClick = () => {
    navigate(`/dataDashboard/${courseId}`);  // Navigate to the DataDashboard with the courseId
  };

  return (
    <div className={`course-card ${color}`} onClick={handleClick}>
      <h3>{courseName}</h3>
      <p>{instructor}</p>
    </div>
  );
};

const ToDoCard = ({ taskName, dueDate, color, border }) => (
  <div
    className={`todo-card ${color} ${border ? `border-${border}` : ""}`}
  >
    <h3>{taskName}</h3>
    <p>{dueDate}</p>
  </div>
);

export default Dashboard;
