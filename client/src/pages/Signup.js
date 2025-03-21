import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { ReactSession } from 'react-client-session';
// import Cookies from 'js-cookie'; // Import js-cookie
import './SignUp.css';
ReactSession.setStoreType("localStorage");

function SignUp() {
  const domain = process.env.REACT_APP_API_BASE_URL || 'localhost';
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [email, setEmail]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole]         = useState('student');
  const [isCanvasAuthenticated, setIsCanvasAuthenticated] = useState(false);

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [canvasToken, setCanvasToken]   = useState('');
  const [refreshToken, setRefreshToken]   = useState('');
  const [canvasAuthenticated, setCanvasAuthenticated] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const canvasTokenUrl = searchParams.get('canvasToken');
    const refreshTokenUrl = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (success && canvasTokenUrl && refreshTokenUrl) {
      console.log('Successfully authenticated with Canvas!');
      setCanvasToken(canvasTokenUrl);
      setRefreshToken(refreshTokenUrl);
      setCanvasAuthenticated(true);
    } else if (error) {
      console.error('Authentication error:', error);
      setCanvasAuthenticated(false);
    }
  }, [searchParams]);

  const exchangeCodeForToken = async (code) => {
    try {
      const response = await axios.post(`http://${domain}:4000/exchange-token`, { code });

      if (response.data.auth_token) {
        setCanvasToken(response.data.auth_token);
        setIsCanvasAuthenticated(true);
        console.log('Canvas token received:', response.data.auth_token);
      } else {
        console.error('Failed to get token:', response.data);
        setIsCanvasAuthenticated(false);
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      setIsCanvasAuthenticated(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isCanvasAuthenticated) {
      alert('Please authenticate with Canvas first before signing up.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
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
          refreshToken,
        }),
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Sign Up Success:', data);
  
        const { userId } = data;
        ReactSession.set("user", userId);
  
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
        ReactSession.set("enrollmentType", resEnrollData[0].role);

        console.log("refreshToken:", refreshToken);
  
        const isTeacher = resEnrollData[0]?.role === "StudentEnrollment" ? false : true;
  
        if (isTeacher) {
          navigate('/teacherBoard');
        } else {
          navigate(`/dashboard/${userId}`);
        }
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
    localStorage.setItem('oauthState', state);
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

            <button 
              type="button" 
              className={`canvas-login-button ${isCanvasAuthenticated ? 'authenticated' : ''}`} 
              onClick={handleCanvasLogin}
            >
              {isCanvasAuthenticated ? '✓ Authenticated with Canvas' : 'Authenticate with Canvas'}
            </button>

            {/* Submit Button */}
            <button 
              className="signin-button" 
              type="submit"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;