import React, { useEffect, useState } from "react";
import { FaStore, FaTruck, FaShop } from "react-icons/fa";
import axios from "axios";

const PopularCompanies = () => {
  const [companies, setCompanies] = useState([
    {
      id: 1,
      title: "Nairobi Tailoring Hub",
      location: "Westlands, Nairobi, Kenya",
      openPositions: 15,
      icon: <FaStore aria-hidden="true" />,
    },
    {
      id: 2,
      title: "Mombasa Carpentry Co.",
      location: "Nyali, Mombasa, Kenya",
      openPositions: 8,
      icon: <FaTruck aria-hidden="true" />,
    },
    {
      id: 3,
      title: "Kisumu Food Market",
      location: "Kisumu Central, Kisumu, Kenya",
      openPositions: 12,
      icon: <FaShop aria-hidden="true" />,
    },
  ]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getall`);
        const employerJobs = data.jobs.reduce((acc, job) => {
          const employerId = job.postedBy.toString();
          if (!acc[employerId]) {
            acc[employerId] = { jobs: [], employer: job.postedBy };
          }
          acc[employerId].jobs.push(job);
          return acc;
        }, {});
        const mappedCompanies = Object.values(employerJobs)
          .slice(0, 3)
          .map((employerData, index) => ({
            id: index + 1,
            title: employerData.employer.name || `Employer ${index + 1}`,
            location: employerData.jobs[0]?.city
              ? `${employerData.jobs[0].city}, Kenya`
              : "Kenya",
            openPositions: employerData.jobs.length,
            icon: getIcon(index),
          }));
        setCompanies(mappedCompanies.length > 0 ? mappedCompanies : companies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  const getIcon = (index) => {
    const icons = [
      <FaStore aria-hidden="true" />,
      <FaTruck aria-hidden="true" />,
      <FaShop aria-hidden="true" />,
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="companies">
      <div className="container">
        <h3>TOP LOCAL EMPLOYERS</h3>
        <div className="banner">
          {companies.map((element) => (
            <div className="card" key={element.id}>
              <div className="content">
                <div className="icon">{element.icon}</div>
                <div className="text">
                  <p>{element.title}</p>
                  <p>{element.location}</p>
                </div>
              </div>
              <button aria-label={`View ${element.openPositions} open positions at ${element.title}`}>
                Open Opportunities {element.openPositions}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularCompanies;