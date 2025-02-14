import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './TeacherDashboardPage.css';
import RadarChart from '../components/RadarChart';

export default function StudentDashboardPage() {
    const [courses, setCourses] = useState([]); // Store courses data
    const [error, setError] = useState(''); // Store error messages
    const [selectedCourse, setSelectedCourse] = useState('');
    const [studentRadarLabels, setStudentRadarLabels] = useState([]);
    const [studentRadarData, setStudentRadarData] = useState([]);

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
        // fetchCoursesGraphQL();
    }, []); // Re-run the effect if the token changes

    //  useEffect(() => {
    //      if (selectedRubricItems.size > 0) {
    //          loadRadarDataByStudent(selectedStudent);
    //          loadRadarDataByAssignment(selectedAssignment);
    //      } else {
    //          setStudentRadarLabels([]);
    //          setStudentRadarData([]);
    //      }
    //  }, [selectedStudent]);

    // const handleCourseSelect = (courseId) => {
    //     setSelectedCourseId(courseId); // Save the selected course ID to state
    //     window.location.href = `/course-summary-student?courseId=${courseId}`;
    // };

    const toggleSelectedCourse = (item) => {
        if (selectedCourse === "") {
            setSelectedCourse(item);
        } else {
            setSelectedCourse("");
        }
    };

    return (
        <div>
            <Navbar />
            <div>
                <p>THIS IS THE STUDENT DASHBOARD PAGE</p>
            </div>
            {/* Display error message if there's an issue */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="dashboard_layout">
                <div className="rubric_column">
                    <h4>Courses</h4>
                    {courses.map((course) => (
                        <div
                            key={course}
                            className={`rubric-item ${selectedCourse == course ? 'selected' : ''}`}
                            onClick={() => toggleSelectedCourse(course)}
                        >
                            {course.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* <div className="chart_container">
                <div className="summary_container" id="chart_container">
                    <h4>{}'s Ability Chart</h4>
                    <RadarChart 
                        dataset={studentRadarData} 
                        labels={studentRadarLabels} 
                        dataset_label={selectedStudent ? selectedStudent.user.name + "'s Ability" : "Class Average Ability"}
                    />
                </div>
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
