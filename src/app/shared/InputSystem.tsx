import React from "react";
import { Eye } from "lucide-react";
import Image from "next/image";

interface InputFieldProps {
  type?: "text" | "email" | "password" | "otp";
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  otpIndex?: number;
  onOtpKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = "email",
  label,
  value,
  onChange,
  placeholder,
  error,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  otpIndex,
  onOtpKeyDown,
  className = "",
}) => {
  // For OTP inputs
  if (type === "otp") {
    return (
      <input
        id={`otp-${otpIndex}`}
        type="text"
        maxLength={1}
        placeholder="0"
        className={`w-[38px] h-[40px] sm:w-[72px] sm:h-[60px] md:w-[93px] md:h-[64px] 
          mt-[30px] sm:mt-[40px] md:mt-[60px] 
          bg-gradient-to-b from-[#202020] to-[#101010] border 
          ${error ? "border-red-500" : "border-[#404040]"} 
          rounded-xl text-center text-white text-lg font-semibold  
          focus:outline-none transition-colors ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onOtpKeyDown}
      />
    );
  }

  // For regular inputs
  return (
    <div className="space-y-1 max-w-[1100px]">
      <label className="text-white text-sm font-medium leading-[18px]">
        {label}
      </label>
      <div className="relative">
        <input
          type={
            type === "password" && !isPasswordVisible ? "password" : type === "password"?"text":type==="email"?"email":"text"
          }
          placeholder={placeholder}
          className={`w-full mt-[10px] text-[14px] bg-gradient-to-b from-[#202020] to-[#101010] border ${
            error ? "border-red-500" : "border-[#404040]"
          } rounded-xl px-4 py-3 pr-12 text-white focus:outline-none transition-colors ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute cursor-pointer right-3 top-8 transform -translate-y-1/2 text-[#999999]"
          >
            {isPasswordVisible ? (
              <Image
                src="/images/eye-off.png"
                alt="hide password"
                width={20}
                height={20}
              />
            ) : (
              <Eye size={20} />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default InputField;