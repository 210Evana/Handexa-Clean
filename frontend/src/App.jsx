import React, { useContext, useEffect } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import PostJob from "./components/Job/PostJob";
import NotFound from "./components/NotFound/NotFound";
import MyJobs from "./components/Job/MyJobs";
import MessagePage from "./components/Messages/MessagePage";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Contact from "./components/Contact/Contact.jsx";
import SearchResults from "./components/Job/SearchResults";


const App = () => {
  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);
  useEffect(() => {
    const fetchUser = async () => {
      try {
  const response = await axios.get(
    `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
    { withCredentials: true }
  );
  setUser(response.data.user);
  setIsAuthorized(true);
} catch (error) {
  setIsAuthorized(false);
  if (error.response?.status === 401) {
    navigate("/login");
  }
}

    fetchUser();
  }, []);

  return (
    <>
      <BrowserRouter>
        
        <Navbar />
       
        {/* Main content will be rendered here */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/job/getall" element={<Jobs />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/application/:id" element={<Application />} />
          <Route path="/applications/me" element={<MyApplications />} />
          <Route path="/job/post" element={<PostJob />} />
          <Route path="/job/me" element={<MyJobs />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/message/:applicationId" element={<MessagePage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/contact" element={<Contact />} /> 
          <Route path="/job/search" element={<SearchResults />} />

          
        </Routes>
        
      
        <Footer />
     
        <Toaster />
      </BrowserRouter>
    </>
  );
};

export default App;
