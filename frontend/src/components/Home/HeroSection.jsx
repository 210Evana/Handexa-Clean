import React from "react";
import {Link } from "react-icons/dom";

const HeroSection = () => {
  return (
    <div className="heroSection">
      <div className="container">
        <h1>Welcome to Handexa - Kenya’s Informal Job Hub</h1>
        <p>
          Discover opportunities in tailoring, carpentry, food vending, and more. Join thousands of Kenyans connecting with local informal jobs today!
        </p>
        <div className="cta">
          <Link to="/jobs" className="btn" aria-label="Find informal jobs in Kenya">
            Find Jobs
          </Link>
          <Link to="/post-job" className="btn secondary" aria-label="Post a job on Handexa">
            Post a Job
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
