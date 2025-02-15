import React from "react";
import "./RubricCard.css"; // Optional: Create a separate CSS file if needed

const RubricCard = ({ rubricName, color }) => (
  <div className={`course-card ${color}`}>
    <div className={`color-section ${color}`}></div>
    <div className={`text-section ${color}`}>
      <h3>{rubricName}</h3>
    </div>
  </div>
);

export default RubricCard;
