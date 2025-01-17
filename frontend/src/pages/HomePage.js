import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function HomePage() {
  
  return (
    <div>
        <Navbar />
        <div>
            <p>THIS IS YOUR HOME PAGE</p>
        </div>
    </div>
  );
};