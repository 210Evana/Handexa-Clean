import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { MdFindInPage } from "react-icons/md";
import { IoMdSend } from "react-icons/io";

const HowItWorks = () => {
  return (
    <>
      <div className="howitworks">
      <div className="container">
        <h3>How Handexa Works</h3>
        <div className="banner">
          <div className="card">
            <FaUserPlus aria-hidden="true" />
            <p>Create Your Profile</p>
            <p>
              Sign up as a job seeker or employer to join Handexa’s vibrant community. Showcase your skills or post job opportunities in Kenya’s informal sector.
            </p>
          </div>
          <div className="card">
            <MdFindInPage aria-hidden="true" />
            <p>Find or Post Informal Jobs</p>
            <p>
              Browse opportunities like tailoring, carpentry, or food vending, or post openings for skilled workers in your local Kenyan community.
            </p>
          </div>
          <div className="card">
            <IoMdSend aria-hidden="true" />
            <p>Apply or Hire with Ease</p>
            <p>
              Job seekers can apply with a pitch or resume, while employers connect with talented artisans and workers across Kenya.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default HowItWorks;
