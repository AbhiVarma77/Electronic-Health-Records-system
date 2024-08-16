/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStage';

export const PrivateRouter = (props) => {
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useLocalStorage('authToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{props.children}</>;
};
