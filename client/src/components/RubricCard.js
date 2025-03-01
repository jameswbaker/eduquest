import React from "react";
import "./RubricCard.css"; // Optional: Create a separate CSS file if needed

const RubricCard = ({ rubricName, color, onClick }) => (
  <div className={`course-card ${color}`} onClick={onClick}>
    <div className={`color-section ${color}`}></div>
    <div className={`text-section ${color}`}>
      <h3>{rubricName}</h3>
    </div>
  </div>
);

export default RubricCard;
