import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  
  return (
    <div>
        <Navbar />
        <div>
            <p>THIS IS THE LANDING PAGE</p>
        </div>
    </div>
  );
};