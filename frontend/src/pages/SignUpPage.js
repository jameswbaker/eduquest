import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import NavBar from '../components/Navbar';

export default function SignUpPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [canvasToken, setCanvasToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Here, you would typically send the form data to your backend or API
        // For demonstration, we'll just log it.
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Canvas Token:', canvasToken);

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
            });

            if (response.ok) {
                const data = await response.json();
                // console.log(data.message); // Success message
                const { userId } = data;

                // redirect to course selection page
                window.location.href = `/teacher-dashboard?token=${canvasToken}&userId=${userId}`;

                // Reset form
                setUsername('');
                setPassword('');
                setCanvasToken('');
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
        setCanvasToken('');
    };

    return (
        <div>
            <NavBar />
            <div style={styles.container}>
                <h2>Sign Up</h2>
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

                    <label style={styles.label}>Canvas Token</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={canvasToken}
                        placeholder="Enter your Canvas Token"
                        onChange={(e) => setCanvasToken(e.target.value)}
                    />
                    <button type="submit" style={styles.button}>Sign Up</button>
                </form>
            </div>
        </div>
    );
};

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