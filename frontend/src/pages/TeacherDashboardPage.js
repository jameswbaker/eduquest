import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './TeacherDashboardPage.css';

export default function TeacherDashboardPage() {

    const [courses, setCourses] = useState([]);     // Store courses data
    const [error, setError] = useState('');          // Store error messages
    const [selectedCourses, setSelectedCourses] = useState([]); // Track selected courses
    const [selectedCourseId, setSelectedCourseId] = useState(null); // Track selected course ID
    // const location = useLocation();                  // Access the current location

    // Retrieve the token from the query parameters
    // const queryParamsAPIToken = new URLSearchParams(location.search).get('token');
    // const teacherCanvasId = new URLSearchParams(location.search).get('userId');
  
    // Fetch courses from Canvas API
    const fetchCourses = async () => {
        setError('');  // Reset error state
        try {
            // console.log(queryParamsAPIToken);
            // const response = await axios.get('http://localhost:4000/api/courses', {
            //     params: { token: queryParamsAPIToken }, // Pass the API token as a query parameter
            // });
            // const tokenResponse = await axios.get('http://localhost:4000/protected-route');
            // console.log(tokenResponse);
            // const apiToken = tokenResponse.data.canvasToken; // Get API token from query parameters
            const response = await axios.get('http://localhost:4000/api/courses', {
                withCredentials: true,
            });
            setCourses(response.data); // Store the fetched courses
        } catch (error) {
            console.error('Error fetching courses:', error.response ? error.response.data : error.message);
            setError('Error fetching courses. Please check your token and permissions.');
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);  // Re-run the effect if the token changes

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

    /**
     * Called when the user clicks the "Next" button.
     * 1. Takes the list of selected course IDs.
     * 2. For each course, calls a Canvas API (or your own backend) to get detailed info.
     * 3. Stores the relevant info in your database.
    */
    // const handleNext = async () => {
    //     console.log('Selected course IDs:', selectedCourses);

    //     try {
    //     // For each selected course, call Canvas API to get detailed info, then store in DB
    //     for (const courseId of selectedCourses) {
    //         // 1) Call your backend to fetch *detailed* info about this course from Canvas
    //         //    This endpoint is hypothetical; adjust as needed.
    //         //    e.g. GET http://localhost:4000/api/course-details?token=...&courseId=...
    //         const detailResponse = await axios.get('http://localhost:4000/api/course-details', {
    //             params: {
    //                 token: queryParamsAPIToken,
    //                 courseId,
    //             },
    //         });

    //         // Suppose detailResponse.data looks like:
    //         // {
    //         //   course_id: 12345,
    //         //   name: "My Course",
    //         //   account_id: 6789,
    //         //   ...other fields...
    //         // }
    //         const { course_id, name, account_id: canvasAccountId } = detailResponse.data;

    //         // 2) Now store this info in your own database
    //         //    e.g. POST http://localhost:4000/api/store-course
    //         //    sending the relevant fields
    //         await axios.post('http://localhost:4000/api/store-course', {
    //             course_id,
    //             name,
    //             canvas_account_id: canvasAccountId,
    //             local_account_id: localAccountId,
    //         });

    //         console.log(`Stored course ${course_id} (${name}) in DB for user ID: ${localAccountId}`);
    //     }
    //     // You might then navigate to the next page, or show a success message
    //     alert('Courses imported successfully!');
    //     // e.g. navigate to a new route if desired
    //     // navigate('/some-other-page');

    //     } catch (err) {
    //         console.error('Error importing selected courses:', err.response?.data || err.message);
    //         setError('Error importing selected courses. Please try again.');
    //     }
    // };

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
            {/* Show the courses in a table, each with a checkbox */}
            {/* <br/>
            <p>Select the courses you want to add.</p>
            <table style={{ borderCollapse: 'collapse', width: '80%', margin: '0 auto' }}>
                <thead>
                    <tr>
                        <th style={tableHeaderStyle}>Select</th>
                        <th style={tableHeaderStyle}>Course Name</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.id} style={{ borderBottom: '1px solid #ccc' }}>
                        <td style={tableCellStyle}>
                            <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCheckboxChange(course.id)}
                            />
                        </td>
                        <td style={tableCellStyle}>{course.name}</td>
                        
                        </tr>
                    ))}
                </tbody>
            </table> */}

            <div className="courses_container">
                <h4> Courses </h4>
                {courses.map((course) => (
                    <div 
                        className="course_item" 
                        key={course.id} 
                        onClick={() => handleCourseSelect(course.id)}
                    >
                        {course.name}
                    </div>
                    // <tr key={course.id} style={{ borderBottom: '1px solid #ccc' }}>
                    //     <td style={tableCellStyle}>
                    //         <input
                    //             type="checkbox"
                    //             checked={selectedCourses.includes(course.id)}
                    //             onChange={() => handleCheckboxChange(course.id)}
                    //         />
                    //         </td>
                    //     <td style={tableCellStyle}>{course.name}</td>        
                    // </tr>
                ))}
            </div>

            {/* "Next" button at bottom right (simple inline style for demonstration) */}
            {/* <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem' }}>
                <button onClick={handleNext} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                    Next
                </button>
            </div> */}
        </div>
    );
}

const tableHeaderStyle = {
    border: '1px solid #ccc',
    padding: '0.5rem',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
};

const tableCellStyle = {
    border: '1px solid #ccc',
    padding: '0.5rem',
};
