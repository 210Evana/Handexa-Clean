import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate,Link } from "react-router-dom";
import ResumeModal from "./ResumeModal";
import "./Application.css";



const MyApplications = () => {
  const { user } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");

  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

useEffect(() => {
    const fetchApplications = async () => {
      try {
        const endpoint =
          user?.role === "Employer"
            ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/employer/getall`
            : `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/jobseeker/getall`;
        const { data } = await axios.get(endpoint, { withCredentials: true });
        setApplications(data.applications);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch applications");
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
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(data.message);
      setApplications((prev) => prev.filter((application) => application._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete application");
    }
  };

   // ... (previous imports and MyApplications component remain the same)

const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/status/${applicationId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(data.message);
      setApplications((prev) =>
        prev.map((application) =>
          application._id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      );
      if (newStatus === "accepted") {
        toast.success("Payment initiated (pending confirmation)");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

// ... (rest of the component remains the same)

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
        {applications.length <= 0 ? (
          <h4>No Applications Found</h4>
        ) : (
          applications.map((element) =>
            user?.role === "Job Seeker" ? (
              <JobSeekerCard
                element={element}
                key={element._id}
                deleteApplication={deleteApplication}
                openModal={openModal}
                navigateTo={navigateTo}
              />
            ) : (
              <EmployerCard
                element={element}
                key={element._id}
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

export default MyApplications;

const JobSeekerCard = ({ element, deleteApplication, openModal, navigateTo }) => {
  return (
    <div className="job_seeker_card">
      <div className="detail">
        <p><span>Job Title:</span> {element.jobId?.title || "N/A"}</p>
        <p><span>Company:</span> {element.jobId?.company || "N/A"}</p>
        <p><span>Location:</span> {element.jobId?.location || "N/A"}</p>
        <p><span>Name:</span> {element.name}</p>
        <p><span>Email:</span> {element.email}</p>
        <p><span>Phone:</span> {element.phone}</p>
        <p><span>Address:</span> {element.address}</p>
        <p><span>Cover Letter:</span> {element.coverLetter || "None"}</p>
        <p>
          <span>Status:</span>
          <strong
            style={{
              color:
                element.status === "accepted" ? "green" : element.status === "rejected" ? "red" : "orange",
            }}
          >
            {element.status}
          </strong>
        </p>
      </div>
      <div className="resume">
        <img
          src={element.resume.url}
          alt="resume"
          onClick={() => openModal(element.resume.url)}
          style={{ cursor: "pointer" }}
        />
      </div>
      <div className="btn_area">
        <button onClick={() => deleteApplication(element._id)}>Delete Application</button>
        <button onClick={() => navigateTo(`/message/${element._id}`)}>Message</button>
      </div>
    </div>
  );
};

const EmployerCard = ({ element, openModal, handleStatusChange, navigateTo }) => {
  return (
    <div className="job_seeker_card">
      <div className="detail">
        <p><span>Job Title:</span> {element.jobId?.title || "N/A"}</p>
        <p><span>Company:</span> {element.jobId?.company || "N/A"}</p>
        <p><span>Location:</span> {element.jobId?.location || "N/A"}</p>
        <p><span>Name:</span> {element.name}</p>
        <p><span>Email:</span> {element.email}</p>
        <p><span>Phone:</span> {element.phone}</p>
        <p><span>Address:</span> {element.address}</p>
        <p><span>Cover Letter:</span> {element.coverLetter || "None"}</p>
        <p>
          <span>Status:</span>
          <strong
            style={{
              color:
                element.status === "accepted" ? "green" : element.status === "rejected" ? "red" : "orange",
            }}
          >
            {element.status}
          </strong>
        </p>
        <select
          value={element.status}
          onChange={(e) => handleStatusChange(element._id, e.target.value)}
          style={{ background: "#e6f7fc", borderRadius: "6px", padding: "8px" }}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="resume">
        <img
          src={element.resume.url}
          alt="resume"
          onClick={() => openModal(element.resume.url)}
          style={{ cursor: "pointer" }}
        />
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
