import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { Link } from "react-router-dom"; 
import "./AdminDashboard.css";
import toast from "react-hot-toast";

const AdminUsers = () => { const [users, setUsers] = useState([]);

useEffect(() => { const fetchUsers = async () => { const res = await axios.get("http://localhost:4000/api/v1/admin/users", { withCredentials: true }); setUsers(res.data.users); }; fetchUsers(); }, []);

return (
     <div className="admin-users"> 
     <h2>All Users</h2> <table> <thead> <tr> 
        <th>Name</th> 
        <th>Email</th> 
        <th>Role</th>
         <th>Status</th> 
        </tr> </thead> <tbody> 
            {users.map((user) => ( 
                <tr key={user._id}> 
                <td>{user.name}</td> 
                <td>{user.email}</td>
                 <td>{user.role}</td>
                  <td>{user.status}</td> 
                  </tr> ))}
                   </tbody> </table> </div> 
                   ); };

export default AdminUsers;