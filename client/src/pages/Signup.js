import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import './SignUp.css';

function SignUp() {
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

    try {
      const response = await fetch('http://localhost:5001/signup', {
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

        const responseEnrollment = await fetch('http://localhost:4000/api/get-role', {
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
          navigate('/teacheBboard');
        } else {
          navigate("/dashboard/:studentId");
        }

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

            {/* Canvas Token (actual field to send) */}
            <input
              type="text"
              id="canvasToken"
              placeholder="Canvas Token"
              value={canvasToken}
              onChange={(e) => setCanvasToken(e.target.value)}
            />

            {/* Role Selection (kept for UI, not used in request) */}
            <div className="role-selection">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={userRole === 'student'}
                  onChange={() => setUserRole('student')}
                />
                I am a Student
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={userRole === 'teacher'}
                  onChange={() => setUserRole('teacher')}
                />
                I am a Teacher
              </label>
            </div>
            
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
