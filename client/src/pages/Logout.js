import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ReactSession } from 'react-client-session';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    ReactSession.remove('user');

    const isLoggedIn = ReactSession.get('user');
    console.log("User after removal:", isLoggedIn);

    navigate('/');
  }, [navigate]);

  return null;
}
