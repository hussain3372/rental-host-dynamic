"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "@/app/shared/Button";
import DropdownField from "./DropdownField";
import { MappedProperty } from "@/app/api/user-flow/types";

type SearchsectionProps = {
  onSearch: React.Dispatch<React.SetStateAction<MappedProperty[]>>;
  initialValue?: string;
  properties: MappedProperty[];
  onSearchTextChange: (value: string) => void;
  onSearchClick: (
    query?: string,
    location?: string,
    status?: string,
    expiryDate?: string
  ) => void;
  availableLocations: string[];
  availableStatuses: string[];
};

const Searchsection: React.FC<SearchsectionProps> = ({
  initialValue = "",
  onSearchTextChange,
  onSearchClick,
  availableLocations,
  availableStatuses,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("Status");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearchTextChange(value);
  }, [onSearchTextChange]);

  const handleLocationChange = useCallback((location: string) => {
    setSelectedLocation(location);
    // Trigger API call immediately when filter changes
    const expiryParam = selectedDate ? selectedDate.toISOString().split('T')[0] : undefined;
    onSearchClick(
      inputValue,
      location !== "All Locations" ? location : undefined,
      selectedStatus !== "Status" ? selectedStatus : undefined,
      expiryParam
    );
  }, [inputValue, selectedStatus, selectedDate, onSearchClick]);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    // Trigger API call immediately when filter changes
    const expiryParam = selectedDate ? selectedDate.toISOString().split('T')[0] : undefined;
    onSearchClick(
      inputValue,
      selectedLocation !== "All Locations" ? selectedLocation : undefined,
      status !== "Status" ? status : undefined,
      expiryParam
    );
  }, [inputValue, selectedLocation, selectedDate, onSearchClick]);

  const handleDateChange = useCallback((date: Date | null) => {
  setSelectedDate(date);


  const expiryParam = date ? 
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : 
  undefined;


  onSearchClick(
    inputValue,
    selectedLocation !== "All Locations" ? selectedLocation : undefined,
    selectedStatus !== "Status" ? selectedStatus : undefined,
    expiryParam
  );
}, [inputValue, selectedLocation, selectedStatus, onSearchClick]);


  const handleSearchClick = useCallback(() => {
    if (inputValue.length < 3) return;
    
    const expiryParam = selectedDate ? selectedDate.toISOString().split('T')[0] : undefined;
    
    onSearchClick(
      inputValue,
      selectedLocation !== "All Locations" ? selectedLocation : undefined,
      selectedStatus !== "Status" ? selectedStatus : undefined,
      expiryParam
    );
  }, [inputValue, selectedLocation, selectedStatus, selectedDate, onSearchClick]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearchClick();
  }, [handleSearchClick]);

  const CustomDateInput = React.forwardRef<
    HTMLButtonElement,
    { value?: string; onClick?: () => void }
  >(({ value, onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="flex items-center justify-between px-[14px] w-full h-14 bg-[#18191B] text-white rounded-lg p-[14px] cursor-pointer border border-[#2A2B2E]"
    >
      <div className="flex items-center gap-3">
        <Image
          src="/images/expiry-date.png"
          alt="calendar"
          width={24}
          height={24}
        />
        <span className="text-[16px] leading-5 font-medium">
          {value || "Expiry Date"}
        </span>
      </div>
      <Image
        src="/images/dropdown.svg"
        alt="dropdown"
        width={16}
        height={16}
      />
    </button>
  ));
  
  CustomDateInput.displayName = "CustomDateInput";

  return (
    <div className="relative w-full min-h-[685px] sm:min-h-[585px] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Gradient/Background Images - Same as HeroSection */}
      <div className="inset-0 hidden sm:block pointer-events-none">
        <Image
          src="/images/gar1.png"
          alt="gradient"
          width={400}
          height={902}
          className="absolute top-0 left-12 !h-[585px] !w-[400px]"
        />
        <Image
          src="/images/gar2.png"
          alt="gradient"
          width={350}
          height={902}
          className="absolute top-0 left-[30%] !h-[585px] -translate-x-1/2"
        />
        <Image
          src="/images/gar3.png"
          alt="gradient"
          width={300}
          height={902}
          className="absolute top-0 left-1/2 !h-[585px] -translate-x-1/2"
        />
        <Image
          src="/images/gar4.png"
          alt="gradient"
          width={350}
          height={902}
          className="absolute top-0 right-[30%] !h-[585px] translate-x-1/2"
        />
        <Image
          src="/images/gar5.png"
          alt="gradient"
          width={400}
          height={902}
          className="absolute top-0 right-12 !h-[585px] !w-[400px]"
        />
      </div>

      {/* Background Overlay Pattern - Same as HeroSection */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Central Background Image - Same as HeroSection */}
      <div className="inset-0 hidden sm:block z-10 overflow-hidden">
        <Image
          src="/images/search-bg.png"
          alt="Background"
          className="inset-0 absolute !top-2"
          fill
          style={{ transform: "translateY(-7px)" }}
        />
      </div>

      {/* Search Content */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 w-full">
        <div className="text-center bg-gradient-to-r from-white/40 via-white to-white/40 bg-clip-text">
          <h1 className="text-[32px] sm:text-[40px] md:text-[52px] text-transparent font-medium leading-[60px] mt-[52px] mb-4 sm:mb-[40px] w-full max-w-[835px]">
            Trusted Certification for Growth
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row md:w-[608px] lg:w-[860px] bg-[#0A0C0B] rounded-[16px] sm:rounded-[24px] relative px-5 py-[18px] gap-5">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              isSmallScreen
                ? "Search certified"
                : "Search for certified and verified properties..."
            }
            className="flex-1 bg-[#18191B] rounded-[8px] h-[52px] p-4 outline-none text-[18px] leading-[24px] font-medium text-white"
          />
          <div className="w-full lg:w-auto flex justify-end">
            <Button
              text="Find a Verified Stay"
              onClick={handleSearchClick}
              className="w-full sm:w-auto shadow-2xl h-[52px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full sm:w-[500px] md:w-[700px] lg:w-[860px] mt-5 pr-4 sm:pr-[0px] sm:pl-[0px] pl-4">
          <DropdownField
            icon="/images/location.png"
            label={selectedLocation}
            options={["All Locations", ...availableLocations]}
            onSelect={handleLocationChange}
          />
          <DropdownField
            icon="/images/status-icon.png"
            label={selectedStatus}
            options={["Status", ...availableStatuses]}
            onSelect={handleStatusChange}
          />
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MMM dd, yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            customInput={<CustomDateInput />}
            placeholderText="Expiry Date"
            popperClassName="custom-datepicker-popper"
            className="w-full"
            isClearable
          />
        </div>
      </div>

      <style jsx global>{`
        .react-datepicker {
          background-color: white !important;
          border: 1px solid #2a2b2e !important;
          border-radius: 12px !important;
          font-family: inherit !important;
        }
        
        .react-datepicker__header {
          background-color: white !important;
          border-bottom: 1px solid #2a2b2e !important;
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
          padding-top: 12px !important;
          color:black !important;
        }
        
        .react-datepicker__current-month {
          color: black !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          margin-bottom: 8px !important;
        }
        
        .react-datepicker__day-name {
          color: #999 !important;
          font-size: 14px !important;
        }
        
        .react-datepicker__day {
          color: black !important;
          border-radius: 8px !important;
          margin: 2px !important;
        }
        
        .react-datepicker__day:hover {
          background-color: #2a2b2e !important;
          color: white !important;
        }
        
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #EFFC76 !important;
          color: black !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day--disabled {
          color: #555 !important;
        }
        
        .react-datepicker__month {
          padding: 8px !important;
        }
        
        .react-datepicker__navigation {
          top: 12px !important;
        }
        
        .react-datepicker__navigation-icon::before {
          border-color: white !important;
        }
        
        .react-datepicker__navigation:hover *::before {
          border-color: #EFFC76 !important;
        }

        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
          background-color: #18191B !important;
          border: 1px solid #2a2b2e !important;
          border-radius: 8px !important;
        }

        .react-datepicker__month-option,
        .react-datepicker__year-option {
          color: white !important;
          padding: 8px !important;
        }

        .react-datepicker__month-option:hover,
        .react-datepicker__year-option:hover {
          background-color: #2a2b2e !important;
        }

        .react-datepicker__month-option--selected,
        .react-datepicker__year-option--selected {
          background-color: #EFFC76 !important;
          color: white !important;
        }

        .react-datepicker__month-read-view--down-arrow,
        .react-datepicker__year-read-view--down-arrow {
          border-color: white !important;
          border-width: 2px 2px 0 0 !important;
        }

        .react-datepicker__year-read-view,
        .react-datepicker__month-read-view {
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Searchsection;