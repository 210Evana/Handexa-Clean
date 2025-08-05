import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { Link } from "react-router-dom"; 
import "./AdminDashboard.css";
import toast from "react-hot-toast";

const AdminJobs = () => { const [jobs, setJobs] = useState([]);

useEffect(() => { const fetchJobs = async () => { 
    const res = await axios.get("http://localhost:4000/api/v1/admin/jobs",
         { withCredentials: true }); setJobs(res.data.jobs); }; fetchJobs(); }, []);

return ( 
<div className="admin-jobs"> 
<h2>All Jobs</h2> <table> <thead> <tr>
     <th>Title</th> 
     <th>Posted By</th>
      <th>Status</th>
       </tr> 
       </thead> 
       <tbody> 
        {jobs.map((job) => ( 
            <tr key={job._id}> 
            <td>{job.title}</td> 
            <td>{job.postedBy?.name}</td> 
            <td>{job.status}</td> 
            </tr> ))}
             </tbody> 
             </table> 
             </div> ); };

export default AdminJobs;