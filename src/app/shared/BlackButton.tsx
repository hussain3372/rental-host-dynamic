"use client";

import React from "react";
import Image from "next/image";

interface BlackButtonProps {
  text?: string;
  iconSrc?: string;
  iconWidth?: number;
  iconHeight?: number;
  className?: string;
  onClick?: () => void;
}

const BlackButton: React.FC<BlackButtonProps> = ({
  text = "",
  iconSrc,
  iconWidth,
  iconHeight,
  className = "",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 bg-[#2D2D2D] text-white px-4 py-3 rounded-[16px] font-medium shadow-[0px_10px_14px_-0.5px_#00000073,0px_2.29px_3.2px_-0.33px_#00000024,0px_0.6px_0.84px_-0.17px_#00000013,0px_-15px_33px_-4.5px_#0000000D_inset,0px_-4.79px_10.53px_-3.38px_#00000052_inset,0px_-1.81px_3.98px_-2.25px_#00000066_inset,0px_-0.6px_1.31px_-1.13px_#0000006F_inset] transition-colors ${className}`}
    >
      {iconSrc && (
        <Image
          src={iconSrc}
          alt={`${text} icon`}
          width={iconWidth}
          height={iconHeight}
        />
      )}
      <span className="text-[20px] leading-[24px] font-normal">{text}</span>
    </div>
  );
};

export default BlackButton;
