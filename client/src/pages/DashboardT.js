// App.jsx
import React from "react";
import "./DashboardT.css";
import { useNavigate } from 'react-router-dom';


const DashboardT = () => {

  const navigate = useNavigate();

  // TODO: WILL HAV ETO FIX THIS LATER
  const studentId = 0

  const handleStudentView = () => {
    const idToNavigate = studentId || 0;  // Default to 0 if studentId is not provided
    navigate(`/dashboard/${idToNavigate}`);  // Navigate to the student dashboard with the dynamic or default studentId
  };

  return (
    <div className="t-dashboard-container">
      {/* Header */}
      <header className="t-dashboard-header">
        <h1>Teacher's Dashboard</h1>
        <div className="t-header-icons">
          <button className="t-icon-button" onClick={handleStudentView}>Student View</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="t-dashboard-main">
        {/* Courses Section */}
        <div className="t-courses-section">
          <h2>Courses</h2>
          <div className="t-courses-list">
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
    <div className={`t-course-card ${color}`} onClick={handleClick}>
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

export default DashboardT;
