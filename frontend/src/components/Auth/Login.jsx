import React, { useContext, useState } from "react";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaRegUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import "./Auth.css";

const Login = () => {

const [email, setEmail] = useState("");

const [password, setPassword] = useState("");

const [role, setRole] = useState("");

const [showPassword, setShowPassword] = useState(false);

const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);



const handleLogin = async (e) => {

e.preventDefault();

try {

  const { data } = await 
  axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/login`,

    { email, password, role },

    {

      headers: { "Content-Type": "application/json" },

      withCredentials: true,

    }

  );

  toast.success(data.message);

  setUser(data.user);

  setEmail("");

  setPassword("");

  setRole("");

  setIsAuthorized(true);

} catch (error) {

  toast.error(error.response?.data?.message || "Login failed");

}

};

if (isAuthorized) {

return <Navigate to="/" />;

}

return (
  <>

<section className="authPage">

  <div className="container">

    <div className="header">

      <div

        className="logo-bg rounded-circle d-flex align-items-center justify-content-center me-3"

        style={{ width: "110px", height: "60px" }}

      >

        <span className="logo-text text-white fs-3">Welcome</span>

      </div>

      <h1 className="logo-text m-0">

        <span className="logo-hand">Hand</span>

        <span className="logo-exa">Exa</span>

      </h1>

      <h3>Login to your account</h3>

    </div>



    <form onSubmit={handleLogin}>

      <div className="inputTag">

        <label>Login As</label>

        <div>

          <select value={role} onChange={(e) => setRole(e.target.value)} required>

            <option value="">Select Role</option>

            <option value="Employer">Employer</option>

            <option value="Job Seeker">Job Seeker</option>

            <option value="Admin">Admin</option>

          </select>

          <FaRegUser />

        </div>

      </div>



      <div className="inputTag">

        <label>Email Address</label>

        <div>

          <input

            type="email"

            placeholder="evana2003@gmail.com"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            required

          />

          <MdOutlineMailOutline />

        </div>

      </div>



      <div className="inputTag">

        <label>Password</label>

        <div style={{ position: "relative" }}>

          <input

            type={showPassword ? "text" : "password"}

            placeholder="Your Password"

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            required

          />

        
          {showPassword ? (

            <FaEyeSlash

              
              onClick={() => setShowPassword(false)}
              className="password-toggle"

            />

          ) : (

            <FaEye

              
              onClick={() => setShowPassword(true)}
              className="password-toggle"

            />

          )}

        </div>

      </div>



      <button type="submit">Login</button>

      <Link to="/register">Register Now</Link>

    </form>

  </div>



  <div className="banner">

    <img src="/login.avif" alt="login" />

  </div>

</section>
</>
);

};

export default Login;