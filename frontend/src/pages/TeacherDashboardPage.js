import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './TeacherDashboardPage.css';

export default function TeacherDashboardPage() {
    const [courses, setCourses] = useState([]); // Store courses data
    const [error, setError] = useState(''); // Store error messages
    const [selectedCourseId, setSelectedCourseId] = useState('');

    // Fetch courses from Canvas API (REST)
    const fetchCourses = async () => {
        setError(''); // Reset error state
        try {
            const response = await axios.get('http://localhost:4000/api/courses', {
                withCredentials: true,
            });
            console.log(response);
            setCourses(response.data); // Store the fetched courses
        } catch (error) {
            console.error('Error fetching courses:', error.response ? error.response.data : error.message);
            setError('Error fetching courses. Please check your token and permissions.');
        }
    };

    // Run the GraphQL query when the component mounts
    useEffect(() => {
        fetchCourses();
    }, []); // Re-run the effect if the token changes

    const handleCourseSelect = (courseId) => {
        setSelectedCourseId(courseId); // Save the selected course ID to state
        window.location.href = `/course-summary?courseId=${courseId}`;
    };

    return (
        <div>
            <Navbar />
            <div>
                <p>THIS IS THE TEACHER DASHBOARD PAGE</p>
            </div>
            {/* Display error message if there's an issue */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="courses_container">
                <h4>Courses</h4>
                {courses.map((course) => (
                    <div
                        className="course_item"
                        key={course.id}
                        onClick={() => handleCourseSelect(course.id)}
                    >
                        {course.name}
                    </div>
                ))}
            </div>
        </div>
    );
}
