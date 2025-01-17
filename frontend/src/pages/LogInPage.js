import React, { useState } from 'react';
import Navbar from '../components/Navbar';

export default function LogInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here, you would typically authenticate the user with your backend or API
    // For demo, we'll just log it.
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
          credentials: 'include',  // Include cookies in the request
      });

      if (response.ok) {
          const data = await response.json();

          // redirect to teacher dashboard page
          window.location.href = '/teacher-dashboard';

          console.log(data.message); // Success message
          // Reset form
          setUsername('');
          setPassword('');
      } else {
          const errorData = await response.json();
          console.error('Error:', errorData.message);
      }
  } catch (error) {
      console.error('Error:', error);
  }

    // Reset form or handle success/failure as needed
    setUsername('');
    setPassword('');
  };

  return (
    <div>
        <Navbar />
        <div style={styles.container}>
            <h2>Log In</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Username</label>
                <input
                  style={styles.input}
                  type="text"
                  value={username}
                  placeholder="Enter your username"
                  onChange={(e) => setUsername(e.target.value)}
                />

                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" style={styles.button}>
                Log In
                </button>
            </form>
        </div>
    </div>
  );
}

// Optional inline styling for quick demo
const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    margin: '0.5rem 0 0.25rem',
  },
  input: {
    padding: '0.5rem',
    marginBottom: '0.75rem',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};
