import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { Link } from "react-router-dom"; 
import "./AdminDashboard.css";
import toast from "react-hot-toast";

const AdminApplications = () => { const [applications, setApplications] = useState([]);

useEffect(() => { const fetchApplications = async () => { 
    const res = await axios.get("http://localhost:4000/api/v1/application/admin/getall", 
        { withCredentials: true }); setApplications(res.data.application); }; fetchApplications(); }, []);

return ( <div className="admin-applications"> 
<h2>All Applications</h2> 
<table> <thead> <tr>
     <th>Applicant</th> 
     <th>Employer</th> 
     <th>Job</th>
      <th>Status</th>
       <th>Payment</th> 
       </tr> </thead> <tbody>
         {applications.map((app) => ( 
            <tr key={app._id}>
             <td>{app.applicantID.user.name}</td> 
             <td>{app.employerID.user.name}</td> 
             <td>{app.job?.title || 'N/A'}</td> 
             <td>{app.status}</td> 
             <td>{app.paymentStatus}</td> 
             </tr> ))}
              </tbody>
               </table>
                </div> ); };

export default AdminApplications;