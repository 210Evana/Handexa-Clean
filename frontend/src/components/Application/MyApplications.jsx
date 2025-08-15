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
        setApplications(data.applications || []);
      } catch (error) {
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
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete application");
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    const oldApplications = [...applications]; // backup for rollback
    setApplications((prev) =>
      prev.map((app) =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/status/${applicationId}`;
      const { data } = await axios.put(
        url,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(data.message);
      if (data.paymentInitiated) {
        toast.success("Payment initiated (pending confirmation)");
      }
    } catch (error) {
      setApplications(oldApplications); // revert changes
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const getStatusColor = (status) => {
    if (status === "accepted") return "green";
    if (status === "rejected") return "red";
    return "orange";
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
          applications.map((element, index) =>
            user?.role === "Job Seeker" ? (
              <JobSeekerCard
                element={element}
                key={element._id || `jobseeker-${index}`}
                deleteApplication={deleteApplication}
                openModal={openModal}
                navigateTo={navigateTo}
                getStatusColor={getStatusColor}
              />
            ) : (
              element._id && (
                <EmployerCard
                  element={element}
                  key={element._id}
                  openModal={openModal}
                  handleStatusChange={handleStatusChange}
                  navigateTo={navigateTo}
                  getStatusColor={getStatusColor}
                />
              )
            )
          )
        )}
      </div>
      {modalOpen && <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />}
    </section>
  );
};

const JobSeekerCard = ({ element, deleteApplication, openModal, navigateTo, getStatusColor }) => (
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
        <strong style={{ color: getStatusColor(element.status) }}>
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

const EmployerCard = ({ element, openModal, handleStatusChange, navigateTo, getStatusColor }) => (
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
        <strong style={{ color: getStatusColor(element.status) }}>
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

export default MyApplications;
