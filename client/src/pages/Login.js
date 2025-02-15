import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ReactSession } from 'react-client-session'; // <-- Import ReactSession
import './Login.css';

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
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Include cookies if needed
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login Success:', data.message);

        // 1. Store user info in session so other pages know you're logged in
        //    If your backend returns something like data.user, you can store that.
        //    Otherwise, at least store the username:
        ReactSession.set('user', { username });

        // 2. Navigate to your landing page (or any other route you want)
        navigate('/intro');

        // 3. Reset fields
        setUsername('');
        setPassword('');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
        alert(`Login Failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Login Failed: ${error.message}`);
    }
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

            <a href="#" className="forgot-password">
              Forgot Password?
            </a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* Sign-up prompt */}
        <div className="signup-prompt">
          <h2 className="donthaveanaccount">Don't have an account?</h2>
          <NavLink to="/signUp" className="sign-up-button">
            Sign Up Here
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Login;
