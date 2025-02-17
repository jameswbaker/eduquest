import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function StudentProfilePage() {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        fetchStudentAccountInfo();
        fetchCourses();
        fetchStudentCanvasInfo();
    }, []); // Re-run the effect if the token changes

    // useEffect(() => {
    //     fetchAssignments();
    // }, [courses]);

    // Fetch student information from our own database
    const fetchStudentAccountInfo = async() => {
        try {
            const response = await axios.get('http://localhost:4000/protected-route', {
                withCredentials: true,
            });
            setUsername(response.data.username);
        } catch (error) {
            console.error('Error fetching student:', error.response ? error.response.data : error.message);
        }
    }

    // Fetch courses from Canvas API (REST)
    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/courses', {
                withCredentials: true,
            });
            setCourses(response.data); // Store the fetched courses
        } catch (error) {
            console.error('Error fetching courses:', error.response ? error.response.data : error.message);
        }
    };

    // Fetch student information from their canvas account
    const fetchStudentCanvasInfo = async() => {
        try {
            const response = await axios.get('http://localhost:4000/api/users/user-details', {
                withCredentials: true,
            });
            setName(response.data.name);
        } catch (error) {
            console.error('Error fetching student:', error.response ? error.response.data : error.message);
        }
    }

    // const fetchAssignments = async () => {
    //     if (courses) {
    //         // const courseIds = [];
    //         // courses.forEach((course) => {
    //         //     courseIds.add(course.id);
    //         // });
    //         // console.log(courseIds);
    //         try {
    //             courses.forEach((course) => {
    //                 const assignmentResponse = await axios.get(`https://canvas.instructure.com/api/v1/courses/${course.id}/assignments`, {
    //                     withCredentials: true,
    //                 });
    //             });
    //         } catch (error) {
    //             console.error('Error fetching assignments:', error.response ? error.response.data : error.message);
    //         }
    //     }
    // }

    return (
        <div>
            <Navbar />
            <h4>Username: {username}</h4>
            <h4>Name: {name}</h4>
            <h4>Number of active courses: {courses.length}</h4>
        </div>
    );
}