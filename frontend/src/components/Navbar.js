import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav class="navbar">
            <div class="logo">EduQuest</div>
            
            <ul class="nav-links">
                <li>
                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                        <button>Sign Up</button>
                    </Link>
                </li>
                <li>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <button>Login</button>
                    </Link>
                </li>
            </ul>
            <button class="mobile-menu-toggle" aria-label="Toggle menu">&#9776;</button>
        </nav>
    );
};