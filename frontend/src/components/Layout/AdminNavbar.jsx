// src/components/layout/AdminNavbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-brand">
        <h2>Handexa Admin</h2>
      </div>
      <ul className="admin-nav-links">
        <li>
          <Link to="/admin/dashboard">
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin/users">
            <i className="fas fa-users"></i> Users
          </Link>
        </li>
        <li>
          <Link to="/admin/jobs">
            <i className="fas fa-briefcase"></i> Jobs
          </Link>
        </li>
        <li>
          <Link to="/admin/applications">
            <i className="fas fa-file-alt"></i> Applications
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;