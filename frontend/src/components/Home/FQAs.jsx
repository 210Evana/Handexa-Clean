import React, { useState } from "react";

const faqs = [
  {
    q: "What is Handexa?",
    a: "Handexa is Kenya’s informal job hub connecting local workers like tailors, carpenters, and food vendors with employers nearby.",
  },
  {
    q: "Is it free to join?",
    a: "Yes. Signing up, browsing jobs, and posting opportunities is completely free.",
  },
  {
    q: "Do I need a CV to apply?",
    a: "No. You can apply by simply describing your skills or experience. Employers in the informal sector often prefer practical skill showcases.",
  },
  {
    q: "How do I post a job?",
    a: "Click 'Post a Job', fill in details like category, county, and description, and your job will be live instantly.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="faq">
      <div className="container">
        <h3>Frequently Asked Questions</h3>
        {faqs.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? "active" : ""}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <p className="question">{item.q}</p>
            {openIndex === index && <p className="answer">{item.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
