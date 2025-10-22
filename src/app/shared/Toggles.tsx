"use client";
import React from "react";
import { Sun, Moon } from "lucide-react";

export interface ToggleSwitchProps {
  /** Current state of the toggle */
  isOn: boolean;
  /** Handler fired when toggled */
  onToggle: (value: boolean) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Show Sun/Moon icons inside thumb */
  withIcons?: boolean;
  /** Extra className for styling */
  className?: string;

  /** Width & Height of the toggle track */
  trackWidth?: string;
  trackHeight?: string;

  /** Size of the thumb */
  thumbSize?: string;

  /** Icon size (if withIcons is true) */
  iconSize?: string;
  thumbTranslate?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isOn,
  onToggle,
  disabled = false,
  withIcons = false,
  className = "",
  trackWidth = "w-16", // default
  trackHeight = "h-9", // default
  thumbSize = "w-7 h-7", // default
  iconSize = "w-4 h-4", // default
  thumbTranslate = "translate-x-7",
}) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(!isOn)}
      disabled={disabled}
      className={`
  relative inline-flex items-center rounded-full transition-colors duration-300
  ${isOn ? "bg-[#EFFC76]" : "bg-[#FAFAD2]"}
  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
  ${trackWidth} ${trackHeight} px-1
  ${className}
`}


    >
      <span
        className={`
    flex items-center justify-center rounded-full bg-black shadow-md transform transition-transform duration-300
    ${thumbSize}
    ${isOn ? thumbTranslate : "-translate-x-0.5"}
  `}
      >
        {withIcons &&
          (isOn ? (
            <Sun className={`${iconSize} text-yellow-500`} />
          ) : (
            <Moon className={`${iconSize} text-gray-600`} />
          ))}
      </span>
    </button>
  );
};

export default ToggleSwitch;
