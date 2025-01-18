import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import './SignUp.css';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('student'); // Tracks selected role
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/addUser`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "password": password,
        "role": userRole, // Send the selected role to the server
      })
    }).then(response => response.json())
      .then(data => {
        if (data.check) {
          navigate('/intro');
        } else {
          alert('Sign Up Failed');
        }
      });
  };
  const handleSignUp = (gameName) => {
    navigate("/linkCanvas"); // Redirect to the game interface
  };
  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <div className="signup-prompt">
          <h2>Already have an account?</h2>
          <NavLink to="/" className="login-button">Sign In Here</NavLink>
        </div>

        <div className="signup-form">
          <h1>Sign Up</h1>
          <form onSubmit={handleSubmit}>
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
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* TODO: double check this part */}
            <input
              type="test"
              id="canvasToken"
              placeholder="Canvas Token"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
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
            
           {/*  <button type="submit">Sign Up</button> */}
           <button className="start-button" onClick={handleSignUp}>
              Sign Up 
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
