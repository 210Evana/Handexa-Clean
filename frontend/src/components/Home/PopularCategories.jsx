import React, { useEffect, useState } from "react";
import {
  GiSewingNeedle,
  GiWoodenChair,
  GiStreetLight,
  GiFruitBowl
} from "react-icons/gi";
import { FaTools, FaBroom } from "react-icons/fa";
import { MdLocalLaundryService, MdOutlineAgriculture } from "react-icons/md";
import axios from "axios";

const iconMap = {
  "Tailoring & Fashion Design": <GiSewingNeedle aria-hidden="true" />,
  "Carpentry & Furniture Making": <GiWoodenChair aria-hidden="true" />,
  "Electrical & Wiring Services": <GiStreetLight aria-hidden="true" />,
  "Food Vending & Catering": <GiFruitBowl aria-hidden="true" />,
  "Plumbing & Repairs": <FaTools aria-hidden="true" />,
  "Cleaning & Domestic Services": <FaBroom aria-hidden="true" />,
  "Laundry Services": <MdLocalLaundryService aria-hidden="true" />,
  "Farming & Agriculture": <MdOutlineAgriculture aria-hidden="true" />
};

const PopularCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getall`
        );

        const jobCategories = [...new Set(data.jobs.map((job) => job.category))];

        const mappedCategories = jobCategories.slice(0, 8).map((category, index) => ({
          id: index + 1,
          title: category,
          subTitle: `${
            data.jobs.filter((job) => job.category === category).length
          } Open Opportunities`,
          icon: iconMap[category] || <FaTools aria-hidden="true" />
        }));

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
