"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DrawerProps {
  onClose: () => void;
}

interface DropdownProps {
  items: { label: string; onClick: () => void; disabled?: boolean }[];
  isOpen?: boolean;
  onClose?: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  isOpen = true,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (item: { onClick: () => void; disabled?: boolean }) => {
    if (!item.disabled) {
      item.onClick();
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-1 !z-[2000] flex flex-col items-start w-full rounded-[10px] 
                 bg-[radial-gradient(75%_81%_at_50%_18.4%,#202020_0%,#101010_100%)] 
                 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] p-2 border border-gray-700"
    >
      {items.map((item, index) => (
        <button
          key={index}
          disabled={item.disabled}
          onClick={() => handleItemClick(item)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 ease-out
            ${
              item.disabled
                ? "text-white/40 opacity-50 cursor-not-allowed"
                : "text-white/90 hover:text-white hover:bg-white/10 cursor-pointer active:scale-[0.98]"
            }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

Dropdown.displayName = "Dropdown";

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

export default function Drawer({ onClose }: DrawerProps) {
  const [range, setRange] = useState("");
  const [status, setStatus] = useState("");
  const [format, setFormat] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Dropdown states
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);

  const rangeOptions = [
    { label: "Weekly", onClick: () => setRange("weekly") },
    { label: "Monthly", onClick: () => setRange("monthly") },
    { label: "Custom range (start date – end date)", onClick: () => setRange("custom") },
  ];

  const statusOptions = [
    { label: "Active", onClick: () => setStatus("active") },
    { label: "Expired", onClick: () => setStatus("expired") },
    { label: "Pending", onClick: () => setStatus("pending") },
  ];

  const formatOptions = [
    { label: "PDF", onClick: () => setFormat("pdf") },
    { label: "Excel (.xlsx)", onClick: () => setFormat("xlsx") },
    { label: "CSV", onClick: () => setFormat("csv") },
  ];

  const handleExport = () => {
    const exportData = {
      range,
      status,
      format,
      startDate,
      endDate,
    };
    console.log("Exporting report:", exportData);
    alert("Report Exported Successfully!");
    onClose();
  };

  return (
    <div className="bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] rounded-lg text-white flex flex-col justify-between p-[28px] w-[70vw] sm:w-[608px] h-full overflow-y-auto relative">
      {/* Heading */}
      <div>
        <h2 className="text-[20px] font-medium mb-3 ">Export Report</h2>
        <p className="text-[#FFFFFF99]  text-[16px] mb-10 leading-5">
          Download detailed certification data filtered by date, status, or report type.
        </p>

        {/* Report Range */}
        <div className="mb-5 relative">
          <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px]">Report Range</label>
          <div className="relative">
            <button
              onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
              className="w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer text-white placeholder-white/40 transition-colors duration-200 text-left"
            >
              {range || "Select range"}
            </button>
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              height={20}
              width={20}
              className="absolute top-5 right-6"
            />
            <Dropdown
              items={rangeOptions}
              isOpen={rangeDropdownOpen}
              onClose={() => setRangeDropdownOpen(false)}
            />
          </div>
        </div>

        {/* Start and End Date */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="relative">
            <label className="block text-[14px] font-medium text-white mb-2">Start date</label>
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
          <div className="relative">
            <label className="block text-[14px] font-medium text-white mb-2">End date</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              customInput={<CustomDateInput placeholder="Select end date" />}
              dateFormat="MMM d, yyyy"
              placeholderText="Select date"
              className="w-full"
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
        </div>

        {/* Certification Status */}
        <div className="mb-5 relative">
          <label className="block text-[14px] font-medium text-white mb-2">Certification status</label>
          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer text-white placeholder-white/40 transition-colors duration-200 text-left"
            >
              {status || "Select status"}
            </button>
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              height={20}
              width={20}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            />
            <Dropdown
              items={statusOptions}
              isOpen={statusDropdownOpen}
              onClose={() => setStatusDropdownOpen(false)}
            />
          </div>
        </div>

        {/* Report Format */}
        <div className="mb-6 relative">
          <label className="block text-[14px] font-medium text-white mb-2">Report format</label>
          <div className="relative">
            <button
              onClick={() => setFormatDropdownOpen(!formatDropdownOpen)}
              className="w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer text-white placeholder-white/40 transition-colors duration-200 text-left"
            >
              {format || "Select format"}
            </button>
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              height={20}
              width={20}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            />
            <Dropdown
              items={formatOptions}
              isOpen={formatDropdownOpen}
              onClose={() => setFormatDropdownOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        className="w-full h-[52px] text-[18px] font-semibold rounded-md yellow-btn text-black text-sm hover:opacity-90 transition-colors duration-200"
        onClick={handleExport}
      >
        Export Report
      </button>
    </div>
  );
}

Drawer.displayName = "Drawer";
