import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Cookies from 'js-cookie'; // Import js-cookie
import './SignUp.css';

function SignUp() {
  const domain = process.env.REACT_APP_API_BASE_URL || 'localhost';
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [email, setEmail]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole]         = useState('student');

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [canvasToken, setCanvasToken]   = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
    // Retrieve the canvasToken (auth_token) from the cookie
    const authToken = Cookies.get('auth_token'); // Using js-cookie to get the cookie
    if (!authToken) {
      alert('Authentication failed. No auth_token. Please log in to Canvas first to get an auth_token.');
      return; // Don't proceed with the sign-up process
    }
    
    setCanvasToken(authToken); // Set the canvasToken in state
  
    try {
      const response = await fetch(`http://${domain}:5001/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          canvasToken,
        }),
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Sign Up Success:', data);
  
        const { userId } = data;
  
        // Query to the callback URL for getting user role
        const responseEnrollment = await fetch(`http://${domain}:4000/api/get-role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
          credentials: 'include'
        });
  
        const resEnrollData = await responseEnrollment.json();
        console.log("RESPONSE_ENROLLMENT: ", resEnrollData);
  
        const isTeacher = resEnrollData[0]?.role === "StudentEnrollment" ? false : true;
  
        if (isTeacher) {
          navigate('/teacherBoard');
        } else {
          navigate(`/dashboard/${userId}`);
        }
  
        // Reset the form fields
        setFirstName('');
        setLastName('');
        setEmail('');
        setUsername('');
        setPassword('');
        setCanvasToken('');
        setConfirmPassword('');
        setUserRole('student');
      } else {
        const errorData = await response.json();
        console.error('Sign Up Failed:', errorData.message);
        alert(`Sign Up Failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Sign Up Failed: ${error.message}`);
    }
  };
  

  const handleCanvasLogin = () => {
    const canvasBaseUrl = "https://cbsd.instructure.com"; // Change this if using a school-specific Canvas URL
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI);
    const state = Math.random().toString(36).substring(7); // Random string for security
  
    const authUrl = `${canvasBaseUrl}/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  
    window.location.href = authUrl; // Redirect the user to Canvas OAuth
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        
        {/* Prompt for existing account */}
        <div className="signup-prompt">
          <h2>Already have an account?</h2>
          <NavLink to="/login" className="login-button">Sign In Here</NavLink>
        </div>

        {/* Sign-up Form */}
        <div className="signup-form">
          <h1>Sign Up</h1>

          <form onSubmit={handleSubmit}>
            {/* First & Last Name (kept for UI, not used in request) */}
            <div className="name-fields">
              <input
                type="text"
                id="firstName"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                id="lastName"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Email (kept for UI, not used in request) */}
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Username (actual field to send) */}
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {/* Password (actual field to send) */}
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Confirm Password (kept for UI/validation, not used in request) */}
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="button" className="canvas-login-button" onClick={handleCanvasLogin}>
              Sign in to Canvas
            </button>

            {/* Submit Button */}
            <button className="signin-button" type="submit">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
