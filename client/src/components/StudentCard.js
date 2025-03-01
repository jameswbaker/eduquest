import React from "react";
import "./StudentCard.css"; // Optional: Create a separate CSS file if needed

const StudentCard = ({ studentName, grade, color, onClick }) => (
<div className={`course-card ${color}`} onClick={onClick}>
    <div className={`color-section ${color}`}></div>
    <div className={`text-section ${color}`}>
    <h3>{studentName}</h3>
    <p>Course Grade: {grade}</p>
    </div>
</div>
);

export default StudentCard;
