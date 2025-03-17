// Login.jsx

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import './Login.css';

// Set the session store type (e.g., localStorage or sessionStorage)
// This only needs to be done once (for example, in your app's entry point).
ReactSession.setStoreType("localStorage");

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Username:', username);
    console.log('Password:', password);
    try {
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: 'include', // Include cookies in the request
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        const { userId } = data;
        console.log("userId in frontend: ", userId);

        // Set the user in the session so it can be accessed elsewhere
        ReactSession.set("user", userId);

        const response_enrollment = await fetch('http://localhost:4000/api/get-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
          credentials: 'include'
        });
        const res_enroll_data = await response_enrollment.json();
        console.log("RESPONSE_ENROLLMENT: ", res_enroll_data[0]);

        // Store the enrollment type (role) in the session
        ReactSession.set("enrollmentType", res_enroll_data[0].role);

        const isTeacher = res_enroll_data[0].role === "StudentEnrollment" ? false : true;
        if (isTeacher) {
          // Redirect to teacher dashboard page
          window.location.href = '/teacherBoard';
        } else {
          // Redirect to student dashboard (replace :studentId with the actual id if needed)
          window.location.href = '/dashboard/:studentId';
        }

        console.log(data.message); // Success message

        // Reset form
        setUsername('');
        setPassword('');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
        // Show error in a pop-up window
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      // Show error in a pop-up window
      alert(`An error occurred: ${error.message}`);
    }
    // Optionally reset form
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Traditional login form */}
        <div className="login-form">
          <h1>Sign In</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <a href="#" className="forgot-password">Forgot Password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>
        {/* Sign-up prompt */}
        <div className="signup-prompt">
          <h2 className="donthaveanaccount">Don't have an account?</h2>
          <NavLink to="/signUp" className="sign-up-button">Sign Up Here</NavLink>
        </div>
      </div>
    </div>
  );
}

export default Login;
