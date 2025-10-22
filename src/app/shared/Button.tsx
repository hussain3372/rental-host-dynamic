"use client";
import React from "react";
import Image from "next/image";

type ButtonProps = {
  text: string;
  icon?: string;
  iconWidth?: number;
  iconHeight?: number;
  onClick?: () => void;

  className?: string;
  width?: string;
  height?: string;
};

const Button: React.FC<ButtonProps> = ({
  text,
  icon,
  iconWidth = 24,
  iconHeight = 24,
  onClick,
  className,
  width,
  height,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
    flex items-center justify-center gap-3
    ${width} ${height}
    px-5 py-3
    rounded-[8px] cursor-pointer
    bg-[#EFFC76] text-[#121315] 
    text-[16px] leading-[20px] font-semibold
   box-shadow: 0 -2px 3px 0 rgba(0, 0, 0, 0.29) inset, 0 -6px 6px 0 rgba(0, 0, 0, 0.26) inset, 0 -14px 8px 0 rgba(0, 0, 0, 0.15) inset, 0 -25px 10px 0 rgba(0, 0, 0, 0.04) inset, 0 -39px 11px 0 rgba(0, 0, 0, 0.01) inset;

 transition-colors ${className}`}
    >
      {icon && (
        <Image
          src={icon}
          alt={text}
          width={iconWidth}
          height={iconHeight}
          className="object-contain"
        />
      )}
      <span
        className="
    text-[16px] leading-[26px] font-semibold text-[#121315]
    
  "
      >
        {text}
      </span>
    </button>
  );
};

export default Button;
