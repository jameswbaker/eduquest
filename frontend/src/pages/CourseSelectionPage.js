import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function CourseSelectionPage() {

    const [courses, setCourses] = useState([]);     // Store courses data
    const [error, setError] = useState('');          // Store error messages
    const [selectedCourses, setSelectedCourses] = useState([]); // Track selected courses
    const location = useLocation();                  // Access the current location

    // Retrieve the token from the query parameters
    const queryParamsAPIToken = new URLSearchParams(location.search).get('token');
  
    // Fetch courses from Canvas API
    const fetchCourses = async () => {
        setError('');  // Reset error state
        try {
            console.log(queryParamsAPIToken);
            const response = await axios.get('http://localhost:4000/api/courses', {
                params: { token: queryParamsAPIToken }, // Pass the API token as a query parameter
            });
            setCourses(response.data); // Store the fetched courses
        } catch (error) {
            console.error('Error fetching courses:', error.response ? error.response.data : error.message);
            setError('Error fetching courses. Please check your token and permissions.');
        }
    };

    useEffect(() => {
        if (queryParamsAPIToken) {
            fetchCourses();  // Fetch courses when the token is available
        } else {
            setError('API token is missing in query parameters.');
        }
    }, [queryParamsAPIToken]);  // Re-run the effect if the token changes

    // Handle checkbox changes
    const handleCheckboxChange = (courseId) => {
        if (selectedCourses.includes(courseId)) {
            // If already selected, remove it
            setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
        } else {
            // Otherwise, add it
            setSelectedCourses([...selectedCourses, courseId]);
        }
    };

    // For demonstration, let’s log what’s selected when you click “Import Selected”
    const handleImportSelected = () => {
        console.log('Selected Courses:', selectedCourses);
        // You can send these to your backend, or handle them however you want
    };

    return (
        <div>
            <Navbar />
            <div>
                <p>THIS IS COURSE SELECTION PAGE</p>
            </div>
            {/* Display error message if there's an issue */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {/* Display each course in courses */}
            <ul>
                {courses.map((course) => (
                    <li key={course.id}>
                        <Link to={`/courses/${course.id}`}>{course.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
