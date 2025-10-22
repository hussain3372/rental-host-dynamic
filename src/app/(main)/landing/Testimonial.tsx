"use client";

import React, { useState } from "react";
import BlackButton from "../../shared/BlackButton";
import Image from "next/image";

const Testimonial = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "This platform simplified our property compliance process. We can track everything in one place, and audits are so much easier now.",
      author: "Sarah Ahmed",
      position: "Property Manager",
    },
    {
      id: 2,
      text: "The user interface is incredibly intuitive and the automated reports have saved us countless hours. Highly recommended for any property business.",
      author: "Michael Chen",
      position: "Real Estate Director",
    },
    {
      id: 3,
      text: "Outstanding customer support and robust features. This solution has transformed how we handle property documentation and compliance tracking.",
      author: "Emma Rodriguez",
      position: "Compliance Officer",
    },
  ];

  // Auto-slide every 5s
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev < testimonials.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  };


  return (
    <div className="bg-[#121315] text-white container-class px-4 md:px-[120px] py-9 md:py-[82px] flex items-center justify-center p-8">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center gap-2 sm:mb-12 mb-0">
          <BlackButton
            text="Testimonials"
            iconSrc="/images/testimonial.png"
            iconWidth={32}
            iconHeight={32}
            className="max-w-[193px] w-full mb-0 sm:mt-10"
          />
        </div>

        {/* Main Content */}
        <div className="relative">
          {/* Testimonial Content */}
          <div className="mb-16">
            <p className="text-[20px] md:text-[30px] lg:text-[44px] lg:leading-[52px] md:[35px] leading=[25px] text-[#FFFFFFCC] font-normal mb-8 min-h-[200px] flex items-center">
              {testimonials[currentSlide].text}
            </p>

            {/* Bottom Row: Author (left) and Arrows (right) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
              {/* Left Side: Number + Author */}
              <div className="flex items-center mb-4 sm:mb-0">
                <span className="text-[24px] leading-[28px] font-normal text-[#FFFFFFCC] me-[20px]">
                  {String(currentSlide + 1).padStart(2, "0")}
                </span>

                <h4 className="text-[16px] sm:text-[28px] leading-[32px] font-medium text-[#FFFFFFCC]">
                  {testimonials[currentSlide].author}
                </h4>
              </div>

              {/* Right Side: Arrows */}
              <div className="flex items-center justify-end gap-[10px]">
                <button
                  onClick={prevSlide}
                  className="w-[56px] h-[56px] rounded-[4px] border border-[#FFFFFF33] flex items-center justify-center p-2 transition-colors duration-200 cursor-pointer"
                >
                  <Image
                    src="/images/arrow-left.png"
                    height={5}
                    width={5}
                    alt="Previous"
                    className="w-5 h-5"
                  />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-[56px] h-[56px] rounded-[4px] border border-[#FFFFFF33] flex items-center justify-center p-2 transition-colors duration-200 cursor-pointer"
                >
                  <Image
                    src="/images/arrow-right.png"
                    height={5}
                    width={5}
                    alt="Next"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

          </div>


          {/* Step Progress Line */}
          <div className="relative mt-8 w-full">
            {/* background line */}
            <div className="w-full h-1 bg-gray-700"></div>

            {/* filled line */}
            <div
              className="absolute top-0 left-0 h-1 bg-[#EFFC76] transition-all duration-500"
              style={{
                width: `${((currentSlide + 1) / testimonials.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Testimonial;
