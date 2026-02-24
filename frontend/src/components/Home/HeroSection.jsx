import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="heroSection">
      <div className="container">
       <h1>Hire Trusted Skilled Workers Across Kenya</h1>
<p>
Post jobs, review applicants, and connect with reliable artisans fast.
No middlemen. No chaos. Just results.
</p>
  
  <section className="final-cta">
  <div className="container">
    <h2>Ready to Hire?</h2>
    <p>Post your first job in under 2 minutes.</p>
    <Link to="/post-job" className="btn-primary">
      Post a Job Now
    </Link>
  </div>
</section>

      </div>
    </div>
  );
};

export default HeroSection;
