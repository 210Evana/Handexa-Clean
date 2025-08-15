import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";
import "./Application.css";

const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();

  useEffect(() => {
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const endpoint =
        user?.role === "Employer"
          ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/employer/getall`
          : `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/jobseeker/getall`;
      const { data } = await axios.get(endpoint, { withCredentials: true });
      console.log("Fetched applications:", data.applications); // Debug log
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Fetch applications error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };
  if (isAuthorized && user) {
    fetchApplications();
  }
}, [isAuthorized, user]);

  if (!isAuthorized) {
    navigateTo("/");
    return null;
  }

  const deleteApplication = async (id) => {
    if (!id) {
      toast.error("Invalid application ID for deletion");
      return;
    }
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(data.message);
      setApplications((prev) => prev.filter((application) => application._id !== id));
    } catch (error) {
      console.error("Delete application error:", error);
      toast.error(error.response?.data?.message || "Failed to delete application");
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
  try {
    const { data } = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/status/${applicationId}`, // Ensure applicationId matches :id
      { status: newStatus },
      { withCredentials: true }
    );
    toast.success(data.message);
    setApplications(prev =>
      prev.map(application => application._id === applicationId ? { ...application, status: newStatus } : application)
    );

    if (newStatus === "accepted") {
      toast.success("Payment initiated (pending confirmation)");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update status");
  }
};

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="my_applications page">
      <div className="container">
        <h1>{user?.role === "Job Seeker" ? "My Applications" : "Applications From Job Seekers"}</h1>
        {loading ? (
          <h4>Loading...</h4>
        ) : applications.length <= 0 ? (
          <h4>No Applications Found</h4>
        ) : (
          applications.map((element) =>
            user?.role === "Job Seeker" ? (
              <JobSeekerCard
                element={element}
                key={element._id || Math.random()} //fallback key
                deleteApplication={deleteApplication}
                openModal={openModal}
                navigateTo={navigateTo}
              />
            ) : (
              <EmployerCard
                element={element}
                key={element._id || Math.random()}
                openModal={openModal}
                handleStatusChange={handleStatusChange}
                navigateTo={navigateTo}
              />
            )
          )
        )}
      </div>
      {modalOpen && <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />}
    </section>
  );
};

const JobSeekerCard = ({ element, deleteApplication, openModal, navigateTo }) => {
  return (
    <div className="job_seeker_card">
      <div className="detail">
        <p><span>Job Title:</span> {element.jobId?.title || "Unknown Job"}</p>
        <p><span>Location:</span> {element.jobId?.location || "Unknown Location"}</p>
        <p><span>Name:</span> {element.name || "N/A"}</p>
        <p><span>Email:</span> {element.email || "N/A"}</p>
        <p><span>Phone:</span> {element.phone || "N/A"}</p>
        <p><span>Address:</span> {element.address || "N/A"}</p>
        <p><span>Cover Letter:</span> {element.coverLetter || "None"}</p>
        <p>
          <span>Status:</span>
          <strong
            style={{
              color:
                element.status === "accepted" ? "green" : element.status === "rejected" ? "red" : "orange",
            }}
          >
            {element.status || "Pending"}
          </strong>
        </p>
      </div>
      <div className="resume">
        {element.resume?.url ? (
          <img
            src={element.resume.url}
            alt="resume"
            onClick={() => openModal(element.resume.url)}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <p>No resume available</p>
        )}
      </div>
      <div className="btn_area">
        <button onClick={() => deleteApplication(element._id)}>Delete Application</button>
        <button onClick={() => navigateTo(`/message/${element._id}`)}>Message</button>
      </div>
    </div>
  );
};

const EmployerCard = ({ element, openModal, handleStatusChange, navigateTo }) => {
  if (!element._id) {
    console.warn("Missing _id for application:", element);
    return null; // Skip rendering if _id is missing
  }
  return (
    <div className="job_seeker_card">
      <div className="detail">
        <p><span>Job Title:</span> {element.jobId?.title || "Unknown Job"}</p>
        <p><span>Location:</span> {element.jobId?.location || "Unknown Location"}</p>
        <p><span>Name:</span> {element.name || "N/A"}</p>
        <p><span>Email:</span> {element.email || "N/A"}</p>
        <p><span>Phone:</span> {element.phone || "N/A"}</p>
        <p><span>Address:</span> {element.address || "N/A"}</p>
        <p><span>Cover Letter:</span> {element.coverLetter || "None"}</p>
        <p>
          <span>Status:</span>
          <strong
            style={{
              color:
                element.status === "accepted" ? "green" : element.status === "rejected" ? "red" : "orange",
            }}
          >
            {element.status || "Pending"}
          </strong>
        </p>
        <select
          value={element.status || "pending"}
          onChange={(e) => handleStatusChange(element._id, e.target.value)}
          style={{ background: "#e6f7fc", borderRadius: "6px", padding: "8px" }}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="resume">
        {element.resume?.url ? (
          <img
            src={element.resume.url}
            alt="resume"
            onClick={() => openModal(element.resume.url)}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <p>No resume available</p>
        )}
      </div>
      <div className="btn_area">
        <button
          onClick={() => navigateTo(`/message/${element._id}`)}
          style={{ background: "#e232bcff" }}
        >
          Message
        </button>
      </div>
    </div>
  );
};

export default MyApplications;