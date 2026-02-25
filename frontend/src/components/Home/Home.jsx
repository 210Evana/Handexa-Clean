import React, { useContext } from "react";
import { Context } from "../../main";
import { Navigate } from "react-router-dom";
import EmployerHome from "./EmployerHome";
import JobSeekerHome from "./JobSeekerHome";

const Home = () => {
  const { isAuthorized, user } = useContext(Context);

  if (!isAuthorized) return <Navigate to="/login" />;

  if (user?.role === "Employer") return <EmployerHome />;
  if (user?.role === "Job Seeker") return <JobSeekerHome />;

  return null;
};

export default Home;