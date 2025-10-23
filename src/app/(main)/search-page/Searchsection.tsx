"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/app/shared/Button";
import DropdownField from "./DropdownField";
import { MappedProperty } from "@/app/api/user-flow/types";

type SearchsectionProps = {
  onSearch: React.Dispatch<React.SetStateAction<MappedProperty[]>>;
  initialValue?: string;
  properties: MappedProperty[];
};

const Searchsection: React.FC<SearchsectionProps> = ({
  onSearch,
  initialValue = "",
  properties,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

  // Dropdown selections
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("Status");
  const [selectedExpiry, setSelectedExpiry] = useState("Expiry Date");

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Filter function - FIXED
  useEffect(() => {
    const filtered = properties.filter((property) => {
      // Search filter - only apply if there's search text
      const matchesSearch = inputValue === "" || 
        property.title.toLowerCase().includes(inputValue.toLowerCase());

      // Location filter - only apply if not "All Locations"
      const matchesLocation = selectedLocation === "All Locations" || 
        (property.location && property.location === selectedLocation);

      // Status filter - only apply if not "Status"
      const matchesStatus = selectedStatus === "Status" || 
        (property.status && property.status === selectedStatus);

      // Expiry filter - only apply if not "Expiry Date"
      const matchesExpiry = selectedExpiry === "Expiry Date" || 
        (property.expiry && property.expiry === selectedExpiry);

      return matchesSearch && matchesLocation && matchesStatus && matchesExpiry;
    });

    onSearch(filtered);
  }, [inputValue, selectedLocation, selectedStatus, selectedExpiry, properties, onSearch]);

  // Handle input clear
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // If input is cleared, ensure we show all properties
    if (value === "") {
      // The useEffect above will handle this automatically with the fixed logic
    }
  };

  return (
    <div className="text-white container-class w-full">
      <div className="inset-0 hidden sm:block z-0 overflow-hidden">
        <Image
          src="/images/search-bg3.svg"
          alt="Background"
          className="inset-0 absolute !top-[-34px] !h-[calc(100%+50px)] object-contain"
          fill
          style={{ transform: "translateY(-37px)" }}
        />
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center ">
        {/* Heading */}
        <div className="text-center bg-gradient-to-r from-white/40 via-white to-white/40 bg-clip-text">
          <h1 className="text-[32px] sm:text-[40px] md:text-[52px] text-transparent font-medium leading-[60px] mt-[52px] mb-4 sm:mb-[40px] w-full max-w-[835px]">
            Trusted Certification for Growth
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row w-full sm:w-[500px] md:w-[608px] lg:w-[860px] bg-[#0A0C0B] rounded-[16px] sm:rounded-[24px] relative px-4 py-[18px] gap-5">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search for certified and verified properties..."
            className="flex-1 bg-[#18191B] rounded-[8px] h-[52px] p-4 outline-none text-[18px] leading-[24px] font-medium text-white"
          />

          <div className="w-full lg:w-auto flex justify-end">
            <Button
              text="Search Certified Host"
              onClick={() => {}}
              className="w-full sm:w-auto shadow-2xl h-[52px]"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full sm:w-[500px] md:w-[700px] lg:w-[860px] mt-5 pr-4 sm:pr-[0px] sm:pl-[0px] pl-4">
          <DropdownField
            icon="/images/location.png"
            label={selectedLocation}
            options={["All Locations", "Lahore", "New York", "Islamabad"]}
            onSelect={setSelectedLocation}
          />
          <DropdownField
            icon="/images/status-icon.png"
            label={selectedStatus}
            options={["Status", "Verified", "Expired", "Near Expiry"]}
            onSelect={setSelectedStatus}
          />
          <DropdownField
            icon="/images/expiry-date.png"
            label={selectedExpiry}
            options={["Expiry Date", "Mar 12, 2025", "Aug 12, 2025", "Jul 12, 2025"]}
            onSelect={setSelectedExpiry}
          />
        </div>
      </div>
    </div>
  );
};

export default Searchsection;