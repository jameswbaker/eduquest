import React from "react";

const RubricList = ({ isOpen, onClose, rubricItems }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Rubric Items</h2>
        <ul className="rubric-list">
          {rubricItems.map((item, index) => (
            <li key={index} className="rubric-item">{item}</li>
          ))}
        </ul>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default RubricList;
