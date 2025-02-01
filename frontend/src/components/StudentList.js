import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import RadarChart from '../components/RadarChart';
import '../pages/CourseSummaryPage.css';
import './StudentList.css'

export default function StudentList({ students, handleStudentSelect, selectedStudent }) {

    useEffect(() => {
        console.log(selectedStudent);
    }, [selectedStudent])

    return (
        <div className="summary_container" id="students_container">
            <h4> Students </h4>
            {students.map((student, index) => (
                student?.user ? (
                    <div 
                        className={`student_item ${selectedStudent?.user?.id === student.user.id ? 'selected' : ''}`} 
                        key={student.user.id || index}  // Fallback key to avoid issues
                        onClick={() => handleStudentSelect(student)}
                    >
                        <p>{student.user.name}</p>
                        {selectedStudent?.user?.id === student.user.id && (
                            <div className="student_details">
                                <p style={{ fontSize: "15px" }}>Email: {student.user.login_id ? student.user.login_id : "N/A"}</p>
                                {student.user.avatar_url && <img src={student.user.avatar_url} alt="Avatar" className="student_avatar"/>}
                            </div>
                        )}
                    </div>
                ) : null  // Skip rendering if student or student.user is undefined
            ))}

        </div>
    );
}