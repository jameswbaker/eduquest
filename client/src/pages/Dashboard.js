import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
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
              color="yellow"
              border="black"
            />
            <ToDoCard
              taskName="Problem-Solution Essay Writing"
              dueDate="Due Dec 12"
              color="red"
              border="black"
            />
            <ToDoCard
              taskName="White Paper"
              dueDate="Due Oct 12 Finished Oct 10"
              color="green"
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
