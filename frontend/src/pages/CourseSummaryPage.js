import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import RadarChart from '../components/RadarChart';
import './CourseSummaryPage.css';

const radarData = [92, 59, 90, 25, 56, 64, 40];
const radarLabels = [
    'Following instructions',
    'Teamwork',
    'Working independently',
    'Communication',
    'Time management',
    'Problem solving',
    'Learning new skills',
];

export default function CourseSummaryPage() {
    const location = useLocation(); // Get the current location object
    const queryParams = new URLSearchParams(location.search); // Parse query parameters
    const courseId = queryParams.get('courseId'); // Retrieve the 'courseId' parameter

    const [students, setStudents] = useState([]);     // Store student data
    const [error, setError] = useState('');          // Store error messages
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [totalStudents, setTotalStudents] = useState('');
    const [assignments, setAssignments] = useState([]);

    // Fetch course details from Canvas API
    const fetchCourseDetails = async () => {
        setError('');
        try {
            const response = await axios.get(`http://localhost:4000/api/courses/${courseId}/course-details`, {
                withCredentials: true,
            });
            setCourseName(response.data.course_name);
            setCourseCode(response.data.course_code);
            setTotalStudents(response.data.total_students);
            setAssignments(response.data.assignments);
        } catch (error) {
            console.error('Error fetching students:', error.response ? error.response.data : error.message);
            setError('Error fetching students. Please check your token and permissions.');
        }
    };
  
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
        fetchCourseDetails();
    }, []);  // Re-run the effect if the token changes

    const handleStudentSelect = (studentId) => {
        setSelectedStudentId(studentId); // Save the selected student ID to state
    };

    return (
        <div>
            <Navbar />
            <div>
                <p>THIS IS THE TEACHER DASHBOARD PAGE</p>
                <h4>{courseCode}: {courseName}, Course ID: {courseId}</h4>
                <h6>Total Students: {totalStudents}</h6>
            </div>
            {/* Display error message if there's an issue */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="chart_container">
                <div className="summary_container" id="students_container">
                    <h4> Students </h4>
                    {students.map((student) => (
                        <div 
                            className="student_item" 
                            key={student.user.id} 
                            onClick={() => handleStudentSelect(student.user.id)}
                        >
                            {student.user.name}
                        </div>
                    ))}
                    <h4> Assignments </h4>
                    {assignments.map((assignment) => (
                        <div 
                            className="student_item" 
                            key={assignment.id} 
                        >
                            {assignment.name}
                            {/* {assignment.rubric} */}
                        </div>
                    ))}
                </div>
                <div className="summary_container" id="chart_container">
                    <h4>Ability Chart: Overall Class</h4>
                    <RadarChart dataset={radarData} labels={radarLabels} />
                    {/* History chart */}
                </div>
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