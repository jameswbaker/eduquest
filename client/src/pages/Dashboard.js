// App.jsx
import React from "react";
import "./Dashboard.css";

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
              courseName="CIS 2450 Big Data"
              instructor="Zachary Ives"
              color="yellow"
            />
            <CourseCard
              courseName="CIS 4000 Senior Project"
              instructor="Boon Thau Loo"
              color="blue"
            />
            <CourseCard
              courseName="CIS 5300 NLP"
              instructor="Mark Yakstar"
              color="red"
            />
            <CourseCard
              courseName="CIS 5800 Machine Perception"
              instructor="Cindy Wei"
              color="pink"
            />
            <CourseCard
              courseName="ESE 4020 Statistics"
              instructor="James Baker"
              color="green"
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ courseName, instructor, color }) => (
  <div className={`course-card ${color}`}>
    <h3>{courseName}</h3>
    <p>{instructor}</p>
  </div>
);

const ToDoCard = ({ taskName, dueDate, color, border }) => (
  <div
    className={`todo-card ${color} ${border ? `border-${border}` : ""}`}
  >
    <h3>{taskName}</h3>
    <p>{dueDate}</p>
  </div>
);

export default Dashboard;
