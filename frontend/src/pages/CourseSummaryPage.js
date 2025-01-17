import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function CourseSummaryPage() {
    const location = useLocation(); // Get the current location object
    const queryParams = new URLSearchParams(location.search); // Parse query parameters
    const courseId = queryParams.get('courseId'); // Retrieve the 'courseId' parameter

    return (
        <div>
            <Navbar />
            <p>THIS IS THE COURSE SUMMARY PAGE</p>
            <h1>Course Summary: {courseId}</h1>

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