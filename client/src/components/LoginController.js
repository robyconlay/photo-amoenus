import React, { useRef, useState } from 'react';

import { useAuthState } from 'react-firebase-hooks/auth';

import {auth } from './helper/firebase'

const LoginController = () => {
  const [user, loading, error] = useAuthState(auth);


  if (loading) {
    return (
      <li className="nav-item">
        <a href="#" className="nav-link">
          <i class="fas fa-spinner"></i>
          <span className="link-text">Loading</span>
        </a>
      </li>
    );
  }
  if (error) {
    return (
      <li className="nav-item">
        <a href="#" className="nav-link">
          <i class="fas fa-exclamation-triangle"></i>
          <span className="link-text">Error</span>
        </a>
      </li>
    );
  }
  if (user) {
    return (
      <li className="nav-item">
        <a href="/logout" className="nav-link">
          <i class="fas fa-sign-out-alt"></i>
          <span className="link-text">Logout</span>
        </a>
      </li>
    );
  }
  return (
    <li className="nav-item">
      <a href="/login" className="nav-link">
        <i className="fas fa-sign-in-alt"></i>
        <span className="link-text">Login</span>
      </a>
    </li>
  )
};

export default LoginController;