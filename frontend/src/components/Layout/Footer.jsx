import React, { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaLinkedin } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";

const Footer = () => {
  const { isAuthorized } = useContext(Context);
  return (
    <footer className={isAuthorized ? "footerShow" : "footerHide"}>
      <div>&copy; All Rights Reserved By Yvanna</div>
      <div>
        <Link to={"https://www.facebook.com/profile.php?id=10909997"} target="_blank">
          <FaFacebookF />
        </Link>
        <Link to={"https://www.youtube.com/@FunWithYvanna"} target="_blank">
          <FaYoutube />
        </Link>
        <Link to={"https://www.youtube.com/@yvannaJuma"} target="_blank">
          <FaLinkedin />
        </Link>
        <Link to={"https://www.instagram.com/evea_nnahjuma/"} target="_blank">
          <RiInstagramFill />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
