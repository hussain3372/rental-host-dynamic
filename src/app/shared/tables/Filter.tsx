"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import Dropdown from "@/app/shared/InputDropDown";
import "react-datepicker/dist/react-datepicker.css";

interface FilterField {
  label: string;
  key: string;
  type: "dropdown" | "date";
  placeholder: string;
  options?: string[];
  value?: Date | null; 
  onChange?: (date: Date | null) => void; 
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  resetLabel?: string;
  onReset: () => void;
  fields: FilterField[];
  buttonLabel: string;
  onApply: () => void;
  filterValues: Record<string, string | Date | null>;
  onFilterChange: (filters: Record<string, string | Date | null>) => void;
  dropdownStates: Record<string, boolean>;
  onDropdownToggle: (key: string, value: boolean) => void;
}

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, CustomDateInputProps>(  ({ value, onClick, placeholder }, ref) => (
    <div className="relative">
      <input
        type="text"
        value={value}
        onClick={onClick}
        ref={ref}
        readOnly
        placeholder={placeholder}
        className="w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer text-white placeholder-white/40 transition-colors duration-200"
      />
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <Image
          src="/images/calender.svg"
          alt="Pick date"
          width={20}
          height={20}
        />
      </div>
    </div>
  )
);

CustomDateInput.displayName = "CustomDateInput";

export default function FilterDrawer({
  isOpen,
  onClose,
  title,
  description,
  resetLabel = "Reset",
  onReset,
  fields,
  buttonLabel,
  onApply,
  filterValues,
  onFilterChange,
  dropdownStates,
  onDropdownToggle,
}: FilterDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>(
  {}
);
useEffect(() => {
  fields.forEach((field) => {
    if (field.type === "dropdown" && !dropdownRefs.current[field.key]) {
      dropdownRefs.current[field.key] = React.createRef<HTMLDivElement | null>();
    }
  });
}, [fields]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Initialize dropdown refs
  fields.forEach((field) => {
    if (field.type === "dropdown" && !dropdownRefs.current[field.key]) {
      dropdownRefs.current[field.key] = React.createRef();
    }
  });

  // Handle mount/unmount with smooth transitions
  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }); 
    } else if (!isOpen && isMounted) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          onDropdownToggle(key, false);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onDropdownToggle]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMounted) {
      document.body.style.paddingRight = "0px";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isMounted]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 250);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 h-full z-[100000] transition-opacity duration-500  ${
          isVisible ? "opacity-70" : "opacity-0"
        }`}
        onClick={handleOverlayClick}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full bg-[#0A0C0B] rounded-lg border-l border-[#FFFFFF1F] z-[2000000000] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? "translate-x-0" : "translate-x-full"
        } w-[250px] sm:w-1/2 lg:w-2/5 xl:w-1/3 shadow-2xl`}
      >
        <div
          className="h-full justify-between flex flex-col bg-[#0A0C0B] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex justify-between items-center px-6 pt-6 pb-3">
              <h3 className="text-white text-[20px] leading-[24px] font-medium">
                {title}
              </h3>
              <button
                onClick={onReset}
                className="text-[#EFFC76] cursor-pointer text-[18px] leading-[22px] font-medium underline transition-opacity duration-200 hover:opacity-80 focus:opacity-80 focus:outline-none"
              >
                {resetLabel}
              </button>
            </div>

            {description && (
              <div className="px-6">
                <p className="text-white text-[16px] opacity-60 mb-10 transition-opacity duration-200">
                  {description}
                </p>
              </div>
            )}

            <div className="px-6 space-y-5">
              {fields.map((field) => (
                <div key={field.key} ref={dropdownRefs.current[field.key]}>
                  <label className="text-white leading-[18px] text-sm font-medium mb-3 block transition-colors duration-200">
                    {field.label}
                  </label>

                  {field.type === "dropdown" ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          onDropdownToggle(
                            field.key,
                            !dropdownStates[field.key]
                          )
                        }
                        className={`
                          w-full px-4 py-3 pr-10 rounded-xl border
                          bg-gradient-to-b from-[#202020] to-[#101010]
                          text-[14px] font-medium text-left
                          transition-all duration-200 ease-out
                          ${
                            !filterValues[field.key]
                              ? "text-white/40 border-[#404040]"
                              : "text-white border-[#505050]"
                          }
                          cursor-pointer
                          hover:border-[#EFFC76] focus:border-[#EFFC76] focus:outline-none
                          active:scale-[0.98]
                        `}
                      >
                        {String(filterValues[field.key] || field.placeholder)}
                        <Image
                          src="/images/dropdown.svg"
                          alt="dropdown"
                          width={15}
                          height={8}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ease-out ${
                            dropdownStates[field.key] ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {dropdownStates[field.key] && field.options && (
                        <div className="absolute z-10 mt-1 w-full animate-in fade-in-0 zoom-in-95 duration-200">
                          <Dropdown
                            items={field.options.map((option) => ({
                              label: option,
                              onClick: () => {
                                onFilterChange({
                                  ...filterValues,
                                  [field.key]: option,
                                });
                                onDropdownToggle(field.key, false);
                              },
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <DatePicker
                      selected={
                        filterValues[field.key] instanceof Date
                          ? (filterValues[field.key] as Date)
                          : null
                      }
                      onChange={(date: Date | null) => {
                        onFilterChange({
                          ...filterValues,
                          [field.key]: date,
                        });
                      }}
                      customInput={
                        <CustomDateInput placeholder={field.placeholder} />
                      }
                      dateFormat="MMM d, yyyy"
                      showMonthDropdown
                      placeholderText="Select date"
                      showYearDropdown
                      dropdownMode="select"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sticky bottom-0 bg-[#0A0C0B] ">
            <button
              onClick={() => {
                onApply();
                setIsVisible(false);
                setTimeout(onClose, 250);
              }}
              className="w-full yellow-btn cursor-pointer text-black font-semibold py-3 sm:py-4 rounded-md transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] text-sm shadow-[inset_0_4px_6px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_6px_8px_rgba(0,0,0,0.4)]"
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}