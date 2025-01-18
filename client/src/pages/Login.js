import React, { useState, Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom"
import { ReactSession } from 'react-client-session';

import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigate();



  const responseFacebook = (response) => {
    fetch(`http://${process.env.process.env.REACT_APP_SERVER_HOST}:${process.env.process.env.REACT_APP_SERVER_PORT}/externalAuthenticator`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ "email": response.email, "username": response.userID, "password": response.accessToken })
    }).then(response => response.json())
      .then(data => {
        if (data.check) {
          ReactSession.setStoreType('localStorage');
          ReactSession.set('user', { name: data.name });
          console.log(ReactSession.get('user'));
          navigation('/intro')
        } else {
          alert('Login Failed');
        }
      })
  };

  const responseGoogle = (response) => {
    if (response.error == "popup_closed_by_user") {
      fetch(`http://${process.env.process.env.REACT_APP_SERVER_HOST}:${process.env.process.env.REACT_APP_SERVER_PORT}/verify`)
        .then(response => response.json())
        .then(data => {
          if (data.check) {
            ReactSession.setStoreType('localStorage');
            ReactSession.set('user', { name: data.name });
            navigation('/intro')
          } else {
            alert('Login Failed');
          }
        })
    }
  }

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   fetch(`http://${process.env.process.env.REACT_APP_SERVER_HOST}:${process.env.process.env.REACT_APP_SERVER_PORT}/authenticator`, {
  //     headers: { 'Content-Type': 'application/json' },
  //     method: 'POST',
  //     body: JSON.stringify({ "email": email, "password": password }) // body data type must match "Content-Type" header
  //   }).then(response => response.json())
  //     .then(data => {
  //       if (data.check) {
  //         ReactSession.setStoreType('localStorage');
  //         ReactSession.set('user', { name: data.name });
  //         console.log(ReactSession.get('user'));
  //         navigation('/intro')
  //       } else {
  //         alert('Login Failed');
  //       }
  //     })
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigation('/intro');
  };
  

  return (

<div class="login-container">
  <div class="login-wrapper">
    <div class="login-form">
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
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
  
        <a href="#" class="forgot-password">Forgot Password?</a>
  
        <button type="submit">Sign In</button>
      </form>
    </div>
    <div class="signup-prompt">
      <h2 className="donthaveanaccount">Don't have an account?</h2>
      <NavLink to={`/signUp`} className="sign-up-button">Sign Up Here</NavLink>
    </div>
  </div>
</div>

  
 



  );

}

export default Login;