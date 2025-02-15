import React from "react";
import "./AssignmentCard.css"; // Optional: Create a separate CSS file if needed

const AssignmentCard = ({ assignmentName, dueDate, color, onClick }) => (
<div className={`course-card ${color}`} onClick={onClick}>
    <div className={`color-section ${color}`}></div>
    <div className={`text-section ${color}`}>
    <h3>{assignmentName}</h3>
    <p>Due Date: {dueDate ?? "No Deadline"}</p>
    </div>
</div>
);

export default AssignmentCard;

  