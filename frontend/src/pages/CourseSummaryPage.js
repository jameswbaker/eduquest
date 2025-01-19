import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function CourseSummaryPage() {
    const location = useLocation(); // Get the current location object
    const queryParams = new URLSearchParams(location.search); // Parse query parameters
    const courseId = queryParams.get('courseId'); // Retrieve the 'courseId' parameter

    const [students, setStudents] = useState([]);     // Store student data
    const [error, setError] = useState('');          // Store error messages
    const [selectedStudentId, setSelectedStudentId] = useState('');
  
    // Fetch students from Canvas API
    const fetchStudents = async () => {
        setError('');  // Reset error state
        try {
            const response = await axios.get(`http://localhost:4000/api/courses/${courseId}/students`, {
                withCredentials: true,
            });
            setStudents(response.data); // Store the fetched students
        } catch (error) {
            console.error('Error fetching students:', error.response ? error.response.data : error.message);
            setError('Error fetching students. Please check your token and permissions.');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);  // Re-run the effect if the token changes

    const handleStudentSelect = (studentId) => {
        setSelectedStudentId(studentId); // Save the selected student ID to state
        window.location.href = `/course-student-summary?studentId=${studentId}`;
    };

    return (
        <div>
            <Navbar />
            <div>
                <p>THIS IS THE TEACHER DASHBOARD PAGE</p>
                <h1>Course Summary: {courseId}</h1>
            </div>
            {/* Display error message if there's an issue */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="courses_container">
                <h4> Students </h4>
                {students.map((student) => (
                    <div 
                        className="student_item" 
                        key={student.id} 
                        onClick={() => handleStudentSelect(student.id)}
                    >
                        {student.name}
                    </div>
                ))}
            </div>

            {/* Pull course information */}
            {/* Display blank ability chart */}
            {/* Consider making a separate component for the ability chart */}

            {/*
            FOR THE UI PEEPS:
            Things that need to be fixed:

            Sign Up page:
            - Display error message if Sign up fails
            - Display success message if Sign up works

            Login page:
            - Display error message if Login fails
            - Display success message if Login works

            Teacher Dashboard page:
            - After you sign up / login, the navbar should update so that the sign up/ sign in buttons 
            are replaced with the log out button, and the profile button
            - When you click on a course, you should have the ability to go back

            Overall:
            - Make things pretty
            */}
        </div>
    );
}