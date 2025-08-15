import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
//import JobCard from "../../components/JobCard"; // if you have a job card component
import toast from "react-hot-toast";

const SearchResults = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const category = params.get("category");
        const county = params.get("county");

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/job/search?category=${category}&county=${county}`
        );
        setJobs(res.data.jobs);
      } catch (err) {
        toast.error("No jobs found.");
      }
    };

    fetchJobs();
  }, [location.search]);

  return (
    <div className="job-list-container">
      <h2>Search Results</h2>
      {jobs.length === 0 ? (
        <p>No jobs found matching your criteria.</p>
      ) : (
        jobs.map((job) => <JobCard key={job._id} job={job} />)
      )}
    </div>
  );
};

export default SearchResults;
