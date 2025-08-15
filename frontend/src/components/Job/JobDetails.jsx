import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const navigateTo = useNavigate();

  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setJob(res.data.job);
      })
      .catch((error) => {
         console.error("Error fetching job details:", error);
        navigateTo("/notfound");
      });
  }, []);

  if (!isAuthorized) {
    navigateTo("/login");
    return null;
  }

  return (
    <section className="jobDetail page">
      <div className="container">
        <h3>Job Details</h3>
        <div className="banner">
          <p>
            Title: <span> {job.title}</span>
          </p>
          <p>
            Category: <span>{job.category}</span>
          </p>
          <p>
            County: <span>{job.county}</span>
          </p>
          
          <p>
            Location: <span>{job.location}</span>
          </p>
          <p>
            Description: <span>{job.description}</span>
          </p>
          <p>
            Job Posted On: <span>{job.jobPostedOn }</span>
          </p>
          <p>
           Salary:{" "}
            {job.fixedSalary ? (
              <span>{job.fixedSalary}</span>
            ) : job.salaryFrom && job.salaryTo ? (
              <span>
                {job.salaryFrom} - {job.salaryTo}
              </span>
            ) : (
              <span>N/A</span>
            )}
          </p>
          {user && user.role === "Employer" ? (
            <></>
          ) : job._id ? (
            <Link to={`/application/${job._id}`}>Apply Now</Link>
          ) : (
            <p>Job not available</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobDetails;