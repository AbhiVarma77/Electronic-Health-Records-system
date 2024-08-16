import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useLocalStorage } from '../hooks/useLocalStage';
import logo from '../assets/logo.png';

export const Navbar = () => {
  const navigate = useNavigate();
  const [token] = useLocalStorage('authToken');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div
      className="bg-white d-flex flex-column flex-md-row align-items-center mb-4 items-center p-2 px-2 justify-content-around navbar-custom"
      style={{ color: '#cf2e2e' }}
    >
      <div className="container d-flex justify-content-around navbar-content">
        <img
          src={logo}
          alt="Logo"
          height="48px"
          onClick={() => navigate('/')}
        />
        <h1 className="text-center p-2 navbar-h1" onClick={() => navigate('/')}>
          Electronic Health Record System
        </h1>
      </div>
      {token && (
        <Button
          title="logout"
          onClick={handleLogout}
          buttonStyles={{
            background: 'cf2e2e',
            color: 'white',
            padding: '12px',
            margin: '0px',
          }}
        />
      )}
    </div>
  );
};
