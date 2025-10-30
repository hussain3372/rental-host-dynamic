"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { reports } from "@/app/api/Admin/reports";
import { toast } from "react-hot-toast"; // or your toast library

interface DrawerProps {
  onClose: () => void;
  onReportCreated: () => void;
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

  const handleItemClick = (item: {
    onClick: () => void;
    disabled?: boolean;
  }) => {
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

const CustomDateInput = React.forwardRef<
  HTMLInputElement,
  CustomDateInputProps
>(({ value, onClick, placeholder }, ref) => (
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
));

CustomDateInput.displayName = "CustomDateInput";

export default function Drawer({ onClose, onReportCreated }: DrawerProps) {
  const [reportType, setReportType] = useState("");
  const [certificationStatus, setCertificationStatus] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown states
  const [reportTypeDropdownOpen, setReportTypeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const reportTypeOptions = [
    { label: "WEEKLY", onClick: () => setReportType("WEEKLY") },
    { label: "MONTHLY", onClick: () => setReportType("MONTHLY") },
    { label: "Custom", onClick: () => setReportType("Custom") },
  ];

  const statusOptions = [
    { label: "ALL", onClick: () => setCertificationStatus("ALL") },
    { label: "ACTIVE", onClick: () => setCertificationStatus("ACTIVE") },
    { label: "EXPIRED", onClick: () => setCertificationStatus("EXPIRED") },
    { label: "REVOKED", onClick: () => setCertificationStatus("REVOKED") },
  ];

  const validateForm = () => {
    if (!reportType) {
      toast.error("Please select a report type");
      return false;
    }
    if (!certificationStatus) {
      toast.error("Please select a certification status");
      return false;
    }
    if (reportType === "Custom" && (!startDate || !endDate)) {
      toast.error("Please select both start and end dates for custom range");
      return false;
    }
    if (startDate && endDate && startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return false;
    }
    return true;
  };

  const handleExport = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Calculate date range based on report type
      let calculatedStartDate: Date;
      let calculatedEndDate: Date = new Date();

      if (reportType === "Custom") {
        calculatedStartDate = startDate!;
        calculatedEndDate = endDate!;
      } else {
        calculatedEndDate = new Date();
        calculatedStartDate = new Date();

        if (reportType === "Weekly") {
          calculatedStartDate.setDate(calculatedEndDate.getDate() - 7);
        } else if (reportType === "Monthly") {
          calculatedStartDate.setMonth(calculatedEndDate.getMonth() - 1);
        } else if (reportType === "Yearly") {
          calculatedStartDate.setFullYear(calculatedEndDate.getFullYear() - 1);
        }
      }

      const requestData = {
        reportType,
        certificationStatus,
      };

      const response = await reports.createReport(requestData);

      if (response.success && response.data) {
        toast.success("Report created successfully!");

        // Automatically download the report
        const downloadResponse = await reports.downloadReport(response.data.id);

        if (downloadResponse.success && downloadResponse.data) {
          // Create blob and download
         // Option 2: If it's JSON or needs conversion
            const blob = new Blob([JSON.stringify(downloadResponse.data)], {
              type: "application/octet-stream",
            });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download =
            response.data.fileName || `report-${response.data.id}.pdf`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          toast.success("Report downloaded successfully");
        }

        // Refresh the reports list
        onReportCreated();

        // Close drawer
        onClose();

        // Reset form
        setReportType("");
        setCertificationStatus("");
        setStartDate(null);
        setEndDate(null);
      } else {
  const errorMessage = response.message || "Failed to create report";
  toast.error(errorMessage);
}
} catch (error) {
  console.error("Error creating report:", error);
  if (error && typeof error === 'object' && 'message' in error) {
    toast.error((error as { message: string }).message);
  } else {
    toast.error("Failed to create and export report");
  }
}
  }

  const handleReset = () => {
    setReportType("");
    setCertificationStatus("");
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] rounded-lg text-white flex flex-col justify-between p-[28px] w-[70vw] sm:w-[608px] h-full overflow-y-auto relative">
      {/* Heading */}
      <div>
        <h2 className="text-[20px] font-medium mb-3">Export Report</h2>
        <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5">
          Download detailed certification data filtered by date, status, or
          report type.
        </p>

        {/* Report Type */}
        <div className="mb-5 relative">
          <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px]">
            Report Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setReportTypeDropdownOpen(!reportTypeDropdownOpen)}
              className="w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer text-white placeholder-white/40 transition-colors duration-200 text-left"
              disabled={isLoading}
            >
              {reportType || "Select report type"}
            </button>
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              height={20}
              width={20}
              className="absolute top-3 right-4 pointer-events-none"
            />
            <Dropdown
              items={reportTypeOptions}
              isOpen={reportTypeDropdownOpen}
              onClose={() => setReportTypeDropdownOpen(false)}
            />
          </div>
        </div>

        {/* Start and End Date - Only show for Custom report type */}
        {reportType === "Custom" && (
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="relative">
              <label className="block text-[14px] font-medium text-white mb-2">
                Start date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                customInput={
                  <CustomDateInput placeholder="Select start date" />
                }
                dateFormat="MMM d, yyyy"
                className="w-full"
                placeholderText="Select date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={10}
                scrollableYearDropdown
                maxDate={new Date()}
                disabled={isLoading}
              />
              <Image
                src="/images/calender.svg"
                alt="show calendar"
                height={16}
                width={16}
                className="absolute top-11 right-3 pointer-events-none"
              />
            </div>
            <div className="relative">
              <label className="block text-[14px] font-medium text-white mb-2">
                End date <span className="text-red-500">*</span>
              </label>
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
                minDate={startDate || undefined}
                maxDate={new Date()}
                disabled={isLoading}
              />
              <Image
                src="/images/calender.svg"
                alt="show calendar"
                height={16}
                width={16}
                className="absolute top-11 right-3 pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* Certification Status */}
        <div className="mb-5 relative">
          <label className="block text-[14px] font-medium text-white mb-2">
            Certification status <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer text-white placeholder-white/40 transition-colors duration-200 text-left"
              disabled={isLoading}
            >
              {certificationStatus || "Select status"}
            </button>
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              height={20}
              width={20}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
            <Dropdown
              items={statusOptions}
              isOpen={statusDropdownOpen}
              onClose={() => setStatusDropdownOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          className="flex-1 h-[52px] text-[16px] font-medium rounded-md bg-transparent border border-[#404040] text-white hover:bg-white/5 transition-colors duration-200"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset
        </button>
        <button
          className="flex-1 h-[52px] text-[18px] font-semibold rounded-md yellow-btn text-black hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExport}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Export Report"}
        </button>
      </div>
    </div>
  );
}

Drawer.displayName = "Drawer";
