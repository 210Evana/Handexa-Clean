import React from 'react';
import AdminNavbar from './AdminNavbar';
//import AdminSidebar from './AdminSidebar';
import './AdminLayout.css'; // Assuming you have some CSS for styling

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-content">
        <AdminSidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;