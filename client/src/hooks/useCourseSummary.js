import { useState, useEffect } from 'react';
import axios from 'axios';

export function useCourseSummary(courseId) {
    const domain = process.env.REACT_APP_API_BASE_URL || 'localhost';
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [rubricItems, setRubricItems] = useState([]);
    const [selectedRubricItems, setSelectedRubricItems] = useState(new Set());

    useEffect(() => {
        if (courseId) {
            console.log('a')
            fetchCourseDetails();
            fetchStudents();
        }
    }, [courseId]);

    const fetchCourseDetails = async () => {
        console.log('fetch course');
        try {
            const response = await axios.get(`http://${domain}:4000/api/courses/${courseId}/course-details`, { withCredentials: true });
            console.log('fetching course details: ', response);
            setCourseName(response.data.course_name);
            setCourseCode(response.data.course_code);
            setAssignments(response.data.assignments);
            extractRubricItems(response.data.assignments);
        } catch (err) {
            setError('Error fetching course details.');
        }
    };

    const fetchStudents = async () => {
        console.log('fetch students');
        try {
            const response = await axios.get(`http://${domain}:4000/api/courses/${courseId}/students`, { withCredentials: true });
            console.log('fetching student details: ', response);
            setStudents(response.data);
        } catch (err) {
            setError('Error fetching students.');
        }
    };

    const extractRubricItems = (assignments) => {
        const uniqueRubrics = new Set();
        assignments.forEach(assignment => {
            assignment.rubric?.forEach(criterion => uniqueRubrics.add(criterion.description));
        });
        setRubricItems([...uniqueRubrics]);
    };

    const toggleRubricItem = (item) => {
        setSelectedRubricItems((prev) => {
            const newSelection = new Set(prev);
            if (newSelection.has(item)) {
                newSelection.delete(item);
            } else {
                newSelection.add(item);
            }
            return new Set(newSelection);
        });
    };

    return { 
                students, 
                assignments, 
                courseName, 
                courseCode, 
                rubricItems, 
                selectedRubricItems, 
                toggleRubricItem, 
                error, 
                setError,
                setCourseName,
                setCourseCode,
                setAssignments,
                setRubricItems,
                fetchStudents,
                setSelectedRubricItems
                 };
}
