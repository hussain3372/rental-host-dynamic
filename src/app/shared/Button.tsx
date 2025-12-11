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

  // NEW PROPS
  textSize?: string;
  textLeading?: string;
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
  textSize = "text-[16px]",        // Default size
  textLeading = "leading-[26px]",  // Default leading
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-3
        ${width} ${height}
        px-5 py-3 rounded-[8px] cursor-pointer
        bg-[#EFFC76] text-[#121315] font-semibold
        transition-colors ${className}
      `}
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

      <span className={`${textSize} ${textLeading} font-semibold text-[#121315]`}>
        {text}
      </span>
    </button>
  );
};

export default Button;
