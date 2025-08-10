import React, { useContext, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

const EditProfile = () => {
  const { user, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  // Initialize state with current user data
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: null, // For file upload
  });
  const [previewPic, setPreviewPic] = useState(user?.avatar?.url || "");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic file validation (e.g., image type, size)
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, PNG, GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPic(reader.result); // Preview the selected image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation based on schema
    if (formData.name.length < 3 || formData.name.length > 30) {
      toast.error("Name must be between 3 and 30 characters");
      return;
    }
    if (!validator.isEmail(formData.email)) {
      toast.error("Please provide a valid email");
      return;
    }
    // Basic phone validation (adjust regex as needed)
    if (!/^\d{10,15}$/.test(formData.phone)) {
      toast.error("Please provide a valid phone number (10-15 digits)");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      if (formData.avatar) {
        data.append("avatar", formData.avatar); // Send file for Cloudinary
      }

      const response = await axios.put(
        "http://localhost:4000/api/v1/user/profile",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update user context with new data
      setUser(response.data.user);
      toast.success(response.data.message);
      navigateTo("/"); // Redirect to home
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name (3-30 characters)"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="avatar">Profile Picture</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
          />
          {previewPic && (
            <img
              src={previewPic}
              alt="Profile Preview"
              className="profile-preview"
            />
          )}
        </div>
        <button type="submit" className="submit-button">
          Save Changes
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigateTo("/")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditProfile;