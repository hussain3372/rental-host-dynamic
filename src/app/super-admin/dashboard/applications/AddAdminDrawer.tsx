"use client";
import Image from "next/image";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropdown from "@/app/shared/InputDropDown";
// import { Modal } from "@/app/shared/Modal";

interface AdminDrawerProps {
  onClose: () => void;
}



// Custom DatePicker input
interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <input
      type="text"
      value={value}
      onClick={onClick}
      ref={ref}
      readOnly
      placeholder={placeholder}
      className="w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm 
                 border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer 
                 text-white placeholder-white/40 transition-colors duration-200"
    />
  )
);

CustomDateInput.displayName = "CustomDateInput";

export default function AdminDrawer({ onClose }: AdminDrawerProps) {
  const [admin, setadmin] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Dropdown states
  const [adminDropdownOpen, setadminDropdownOpen] = useState(false);
  

  const adminOptions = [
    { label: "	Dianne Russell", onClick: () => setadmin("	Dianne Russell") },
    { label: "Sarah rosole", onClick: () => setadmin("Sarah rosole") },
    { label: "John doe", onClick: () => setadmin("John Doe") },
  ];

  const handleExport = () => {
    onClose();
  };

  return (
    <>
    <div className="bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] rounded-lg text-white flex flex-col justify-between p-[28px] w-[70vw] sm:w-[608px] h-full overflow-y-auto relative">
      {/* Heading */}
      <div>
        <h2 className="text-[20px] font-medium mb-3 ">Assign Application</h2>
        <p className="text-[#FFFFFF99]  text-[16px] mb-10 leading-5">
          Fill in the below details and select the admin you want to assign to the application.
        </p>
        
        {/* Report admin */}
        <div className="mb-5 relative">
          <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px]">Assign to</label>
          <div className="relative">
            <button
              onClick={() => setadminDropdownOpen(!adminDropdownOpen)}
              className={`w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer ${!admin?"text-white/40":"text-white"} text-white placeholder-white/40 transition-colors duration-200 text-left`}
            >
              {admin|| "Select Admin"}
            </button>
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              height={20}
              width={20}
              className="absolute top-5 right-6"
            />
            <Dropdown
              items={adminOptions}
              isOpen={adminDropdownOpen}
              onClose={() => setadminDropdownOpen(false)}
            />
          </div>
        </div>

        {/* Start and End Date */}
          <div className="relative">
            <label className="block text-[14px] font-medium text-white mb-2">Date assigned</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              customInput={<CustomDateInput placeholder="Select start date" />}
              dateFormat="MMM d, yyyy"
              className="w-full"
              placeholderText="Select date"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={10}
              scrollableYearDropdown
            />
            <Image
              src="/images/calender.svg"
              alt="show calender"
              height={16}
              width={16}
              className="absolute top-11 right-3"
            />
          </div>
          

        {/* Certification Status */}
        

        {/* Report Format */}
        
      </div>

      {/* Export Button */}
      <button
        className="w-full h-[52px] text-[18px] font-semibold rounded-md yellow-btn text-black text-sm hover:opacity-90 transition-colors duration-200"
        onClick={handleExport}
      >
        Assign Application
      </button>
    </div>
  
    </>
  );
}

AdminDrawer.displayName = "AdminDrawer";
