import React, { useEffect, useState } from "react";
import { GiSewingNeedle, GiWoodenChair, GiStreetLight, GiFruitBowl } from "react-icons/gi";
import { FaTools, FaBroom } from "react-icons/fa";
import { MdLocalLaundryService, MdOutlineAgriculture } from "react-icons/md";
import axios from "axios";

const PopularCategories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      title: "Tailoring & Fashion Design",
      subTitle: "150+ Open Opportunities",
      icon: <GiSewingNeedle aria-hidden="true" />,
    },
    {
      id: 2,
      title: "Carpentry & Furniture Making",
      subTitle: "100+ Open Opportunities",
      icon: <GiWoodenChair aria-hidden="true" />,
    },
    {
      id: 3,
      title: "Electrical & Wiring Services",
      subTitle: "80+ Open Opportunities",
      icon: <GiStreetLight aria-hidden="true" />,
    },
    {
      id: 4,
      title: "Food Vending & Catering",
      subTitle: "200+ Open Opportunities",
      icon: <GiFruitBowl aria-hidden="true" />,
    },
    {
      id: 5,
      title: "Plumbing & Repairs",
      subTitle: "90+ Open Opportunities",
      icon: <FaTools aria-hidden="true" />,
    },
    {
      id: 6,
      title: "Cleaning & Domestic Services",
      subTitle: "120+ Open Opportunities",
      icon: <FaBroom aria-hidden="true" />,
    },
    {
      id: 7,
      title: "Laundry Services",
      subTitle: "70+ Open Opportunities",
      icon: <MdLocalLaundryService aria-hidden="true" />,
    },
    {
      id: 8,
      title: "Farming & Agriculture",
      subTitle: "50+ Open Opportunities",
      icon: <MdOutlineAgriculture aria-hidden="true" />,
    },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getall`);
        const jobCategories = [...new Set(data.jobs.map((job) => job.category))];
        const mappedCategories = jobCategories.slice(0, 8).map((category, index) => ({
          id: index + 1,
          title: category,
          subTitle: `${
            data.jobs.filter((job) => job.category === category).length
          } Open Opportunities`,
          icon: getIcon(category),
        }));
        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const getIcon = (category) => {
    const iconMap = {
      "Tailoring & Fashion Design": <GiSewingNeedle aria-hidden="true" />,
      "Carpentry & Furniture Making": <GiWoodenChair aria-hidden="true" />,
      "Electrical & Wiring Services": <GiStreetLight aria-hidden="true" />,
      "Food Vending & Catering": <GiFruitBowl aria-hidden="true" />,
      "Plumbing & Repairs": <FaTools aria-hidden="true" />,
      "Cleaning & Domestic Services": <FaBroom aria-hidden="true" />,
      "Laundry Services": <MdLocalLaundryService aria-hidden="true" />,
      "Farming & Agriculture": <MdOutlineAgriculture aria-hidden="true" />,
    };
    return iconMap[category] || <FaTools aria-hidden="true" />;
  };

  return (
    <div className="categories">
      <h3>POPULAR INFORMAL JOBS IN KENYA</h3>
      <div className="banner">
        {categories.map((element) => (
          <div className="card" key={element.id}>
            <div className="icon">{element.icon}</div>
            <div className="text">
              <p>{element.title}</p>
              <p>{element.subTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;