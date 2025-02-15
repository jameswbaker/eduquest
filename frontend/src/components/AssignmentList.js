import React, { useEffect } from 'react';
import '../pages/CourseSummaryPage.css';
import './AssignmentList.css';

export default function AssignmentList({ assignments, handleAssignmentSelect, selectedAssignment }) {

    return (
        <div className="assignments_container">
            <h4> Assignments </h4>
            {assignments.map((assignment, index) => (
                <div
                    className={`assignment_item ${selectedAssignment?.id === assignment.id ? 'selected' : ''}`}
                    key={assignment.id || index}
                    onClick={() => handleAssignmentSelect(assignment)}
                >
                    <p>{assignment.name}</p>
                    {selectedAssignment?.id === assignment.id && (
                        <div className="assignment_details">
                            <p style={{ fontSize: "15px" }}>ID: {assignment.id}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
