import React, { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [county, setcounty] = useState("");

  const [location, setLocation] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const handleJobPost = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !county || !location) {
      toast.error("Please provide all required job details.");
      return;
    }
    if (salaryType === "default") {
      toast.error("Please select a salary type.");
      return;
    }
    if (salaryType === "Fixed Salary" && !fixedSalary) {
      toast.error("Please provide a fixed salary.");
      return;
    }
    if (salaryType === "Ranged Salary" && (!salaryFrom || !salaryTo)) {
      toast.error("Please provide both salary from and salary to.");
      return;
    }
    await axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/job/post`,
        fixedSalary
          ? { title, description, category, county, location, fixedSalary }
          : { title, description, category, county, location, salaryFrom, salaryTo },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
        navigateTo("/job/getmyjobs");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to post job.");
      });
  };

  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
    return null;
  }

  return (
    <div className="job_post page">
      <div className="container">
        <h3>POST NEW JOB</h3>
        <form onSubmit={handleJobPost}>
          <div className="wrapper">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job Title"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Cleaning & Domestic Services">Cleaning & Domestic Services</option>
              <option value="Chefs & Cooks">Chefs & Cooks</option>
              <option value="Nannies">Nannies</option>
              <option value="Photographers">Photographers</option>
              <option value="Househelps">Househelps</option>
              <option value="Laundry Services">Laundry Services</option>
              <option value="Construction">Construction</option>
              <option value="Artisans">Artisans</option>
              <option value="Gardeners">Gardeners</option>
              <option value="Electrical & Wiring Services">Electrical & Wiring Services</option>
              <option value="Tailoring & Fashion Design">Tailoring & Fashion Design</option>
              <option value="Carpentry & Furniture Making">Carpentry & Furniture Making</option>
              <option value="Plumbing & Repairs">Plumbing & Repairs</option>
              <option value="Masseuse/Masseur">Masseuse/Masseur</option>
              <option value="Event Planners">Event Planners</option>
              <option value="Nail Technicians">Nail Technicians</option>
              <option value="Make Up Artists">Make Up Artists</option>
              <option value="Fumigators">Fumigators</option>
              <option value="Painter">Painter</option>
              <option value="Drivers">Drivers</option>
              <option value="Farming & Agriculture">Farming & Agriculture</option>
              <option value="Food Vending & Catering">Food Vending & Catering</option>
              <option value="Other Informal Jobs">Other Informal Jobs</option>
            </select>
          </div>
          <div className="wrapper">
            <select
              value={county}
              onChange={(e) => setcounty(e.target.value)}
            >
              <option value="">Select County</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Bungoms">Bungoms</option>
              <option value="Kisumu">Kisumu</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Eldoret">Eldoret</option>
              <option value="Nyeri">Nyeri</option>
              <option value="Machakos">Machakos</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
          />
          <div className="salary_wrapper">
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
            >
              <option value="default">Select Salary Type</option>
              <option value="Fixed Salary">Fixed Salary</option>
              <option value="Ranged Salary">Ranged Salary</option>
            </select>
            <div>
              {salaryType === "default" ? (
                <p>Please provide Salary Type *</p>
              ) : salaryType === "Fixed Salary" ? (
                <input
                  type="number"
                  placeholder="Enter Fixed Salary"
                  value={fixedSalary}
                  onChange={(e) => setFixedSalary(e.target.value)}
                />
              ) : (
                <div className="ranged_salary">
                  <input
                    type="number"
                    placeholder="Salary From"
                    value={salaryFrom}
                    onChange={(e) => setSalaryFrom(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Salary To"
                    value={salaryTo}
                    onChange={(e) => setSalaryTo(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          <textarea
            rows="10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Job Description"
          />
          <button type="submit">Create Job</button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
