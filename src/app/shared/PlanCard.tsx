"use client";
import React, { useState } from "react";
import Image from "next/image";

interface PricingCardProps {
  // Required props
  title: string;
  description: string;
  price: string;
  period: string;
  buttonText: string;
  features: string[];
  onBuyNow?: () => void;
  isSelected?: boolean;
  showBorder?: boolean;

  // === CARD CONTAINER STYLING ===
  /** Card background color */
  bgColor?: string;
  /** Card text color */
  textColor?: string;
  /** Card padding */
  padding?: string;
  /** Card maximum width */
  cardMaxWidth?: string;
  /** Card border radius */
  cardRadius?: string;
  /** Card shadow */
  cardShadow?: string;
  /** Card border styling */
  borderStyle?: string;

  // === BORDER COLORS ===
  /** Default border color */
  defaultBorderColor?: string;
  /** Hover border color */
  hoverBorderColor?: string;
  /** Professional plan border color (optional) */
  professionalBorderColor?: string;

  // === HEADER SECTION ===
  /** Title font size (e.g., 'text-[20px]' or 'text-xl') */
  titleClass?: string;
  /** Title font weight (e.g., 'font-semibold' or 'font-[600]') */
  titleWeight?: string;
  /** Title text color */
  titleColor?: string;
  /** Additional title classes */
  titleClasses?: string;
  /** Description font size */
  descriptionClass?: string;
  /** Description font weight */
  descriptionWeight?: string;
  /** Description text color */
  descriptionColor?: string;
  /** Additional description classes */
  descriptionClasses?: string;
  /** Space between title and description */
  headerSpacing?: string;

  // === PRICE SECTION ===
  /** Price font size */
  priceSize?: string;
  /** Price font weight */
  priceWeight?: string;
  /** Price text color */
  priceColor?: string;
  /** Additional price classes */
  priceClasses?: string;
  /** Period font size */
  periodSize?: string;
  /** Period font weight */
  periodWeight?: string;
  /** Period text color */
  periodColor?: string;
  /** Additional period classes */
  periodClasses?: string;
  /** Space above price section */
  priceSpacing?: string;
  /** Space between price and period */
  pricePeriodSpacing?: string;

  // === BUTTON SECTION ===
  /** Show/hide button */
  showButton?: boolean;
  /** Button background color */
  buttonBg?: string;
  /** Button text color */
  buttonTextColor?: string;
  /** Button font size */
  buttonClass?: string;
  /** Button font weight */
  buttonWeight?: string;
  /** Button padding */
  buttonPadding?: string;
  /** Button border radius */
  buttonRadius?: string;
  /** Button width */
  buttonWidth?: string;
  /** Space above button */
  buttonSpacing?: string;
  /** Additional button classes */
  buttonClasses?: string;
  /** Button hover background */
  hoverButtonBg?: string;
  /** Button hover text color */
  hoverButtonText?: string;

  // === FEATURES SECTION ===
  /** Feature list font size */
  featureSize?: string;
  /** Feature list font weight */
  featureWeight?: string;
  /** Feature list text color */
  featureColor?: string;
  /** Space between features */
  featureSpacing?: string;
  /** Additional feature classes */
  featureClasses?: string;
  /** Show check icons */
  showFeatureIcons?: boolean;
  /** Check icon source */
  checkIconSrc?: string;
  /** Check icon width */
  featureIconWidth?: number;
  /** Check icon height */
  featureIconHeight?: number;
  /** Feature hover effect */
  featureHoverEffect?: boolean;
  /** Space between icon and text */
  featureIconSpacing?: string;

  // === DIVIDER SECTION ===
  /** Show/hide divider */
  showDivider?: boolean;
  /** Divider styling classes */
  dividerStyle?: string;
  /** Divider spacing (margin) */
  dividerSpacing?: string;
  /** Divider width */
  dividerWidth?: string;
  /** Divider height */
  dividerHeight?: string;

  // === HOVER EFFECTS ===
  /** Enable all hover effects */
  enableHoverEffects?: boolean;
  /** Hover transform effect */
  hoverTransform?: string;
  /** Hover transition duration */
  hoverTransition?: string;
  /** Show hover overlay */
  hoverOverlay?: boolean;
  /** Hover overlay gradient */
  overlayGradient?: string;

  // === SPECIAL EFFECTS ===
  /** Mark as professional plan */
  isProfessionalPlan?: boolean;
  /** Enable professional glow effect */
  professionalGlow?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  // Required props
  title,
  description,
  price,
  period,
  showBorder = true,
  onBuyNow,
  buttonText,
  features,

  // Card container defaults
  bgColor = "bg-black",
  textColor = "text-white",
  padding = "p-[20px] sm:p-[36px]",
  cardMaxWidth = "w-full max-w-[365px]",
  cardRadius = "rounded-2xl",
  cardShadow = "shadow-lg",
  borderStyle = "border-l-[1px] border-r-[1px] border-t-[2px] border-white",

  // Border color defaults
  defaultBorderColor = "#2f3030",
  hoverBorderColor = "#EFFC76",
  professionalBorderColor = "#737852",

  // Header defaults
  titleClass = "text-[24px] leading-[28px]",
  titleWeight = "font-semibold",
  titleColor = "",
  titleClasses = "",
  descriptionClass = "text-[16px] leading-[20px]",
  descriptionWeight = "font-medium",
  descriptionColor = "text-[#FFFFFFCC]",
  descriptionClasses = "",
  headerSpacing = "pt-1",

  // Price defaults
  priceSize = "text-[60px] leading-[68px]",
  priceWeight = "font-semibold",
  priceColor = "text-[#EFFC76]",
  priceClasses = "",
  periodSize = "text-[16px] leading-[20px]",
  periodWeight = "font-medium",
  periodColor = "text-[#FFFFFFCC]",
  periodClasses = "",
  priceSpacing = "mt-[32px]",
  pricePeriodSpacing = "pt-1",

  // Button defaults
  showButton = true,
  buttonBg = "bg-gray-700",
  buttonTextColor = "text-white",
  buttonClass = "text-[16px]",
  buttonWeight = "font-semibold",
  buttonPadding = "py-[10px] px-[20px]",
  buttonRadius = "rounded-[10px]",
  buttonWidth = "w-full",
  buttonSpacing = "mt-6",
  buttonClasses = "",
  hoverButtonBg = "bg-[#EFFC76]",
  hoverButtonText = "text-black",

  // Features defaults
  featureSize = "text-[16px] leading-[20px]",
  featureWeight = "font-medium",
  featureColor = "",
  featureSpacing = "space-y-2",
  featureClasses = "",
  showFeatureIcons = true,
  checkIconSrc = "/images/check.png",
  featureIconWidth = 18,
  featureIconHeight = 13,
  featureHoverEffect = true,
  featureIconSpacing = "space-x-[8px]",

  // Divider defaults
  showDivider = true,
  dividerStyle = "bg-gradient-to-r from-transparent via-white to-transparent",
  dividerSpacing = "my-[32px]",
  dividerWidth = "w-[250px] sm:w-[304px]",
  dividerHeight = "h-[1px]",

  // Hover defaults
  enableHoverEffects = true,
  hoverTransform = "translateY(-8px)",
  hoverTransition = "all 0.3s ease",
  hoverOverlay = true,
  overlayGradient = "bg-gradient-to-b from-[#EFFC76]/10 to-transparent opacity-30",

  // Special effects defaults
  isProfessionalPlan = false,
  professionalGlow = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine border color based on props
  const getBorderColor = () => {
    if (!enableHoverEffects) return defaultBorderColor;

    if (isHovered) {
      return hoverBorderColor;
    }

    return isProfessionalPlan ? professionalBorderColor : defaultBorderColor;
  };

  const cardStyle = {
    ...(enableHoverEffects
      ? {
          borderTopColor: getBorderColor(),
          borderRightColor: getBorderColor(),
          borderLeftColor: getBorderColor(),
          transform: isHovered ? hoverTransform : "translateY(0)",
          transition: hoverTransition,
        }
      : {}),
    backgroundColor: bgColor?.startsWith("#") ? bgColor : undefined,
  };

  return (
    <div
      style={cardStyle}
      className={`${cardRadius} ${cardMaxWidth} ${
        isHovered
          ? "hover:bg-gradient-to-b from-[#2a2e1a] via-[#2a2e1a] to-[#121315]"
          : ""
      } ${showBorder ? borderStyle : ``}  ${cardShadow} ${borderStyle} ${
        bgColor?.startsWith("#") ? "" : bgColor
      } ${textColor} flex flex-col justify-between relative overflow-hidden ${padding}`}
      onMouseEnter={enableHoverEffects ? () => setIsHovered(true) : undefined}
      onMouseLeave={enableHoverEffects ? () => setIsHovered(false) : undefined}
    >
      {/* Hover effect overlay */}
      {hoverOverlay && isHovered && (
        <div className={`absolute inset-0 ${overlayGradient} z-0`}></div>
      )}

      {/* Glow effect for professional plan */}
      {isProfessionalPlan && professionalGlow && isHovered && (
        <div className="absolute inset-0 rounded-2xl shadow-[0_0_25px_rgba(239,252,118,0.3)] z-0"></div>
      )}

      {/* Header */}
      <div className="relative z-10">
        <h3
          className={`${titleClass} ${titleWeight} ${titleColor} ${titleClasses}`}
        >
          {title}
        </h3>
        <p
          className={`${descriptionClass} ${descriptionWeight} ${descriptionColor} ${descriptionClasses} ${headerSpacing}`}
        >
          {description}
        </p>
      </div>

      {/* Price */}
      <div className={`${priceSpacing} relative z-10`}>
        <p
          className={`${priceSize} ${priceWeight} ${priceColor} ${priceClasses}`}
        >
          {price}
        </p>
        <span
          className={`${periodSize} ${periodWeight} ${periodColor} ${periodClasses} ${pricePeriodSpacing}`}
        >
          {period}
        </span>
      </div>

      {/* Button */}
      {showButton && (
        <button
          onClick={onBuyNow}
          className={`${buttonSpacing} ${buttonWidth} ${buttonPadding} ${buttonRadius} ${buttonClass} ${buttonWeight} ${buttonClasses} cursor-pointer transition-all duration-300 flex items-center justify-center relative z-10 ${
            isHovered && enableHoverEffects
              ? `${hoverButtonBg} ${hoverButtonText} shadow-[inset_5px_-54px_22px_0px_#00000008,inset_3px_-30px_18px_0px_#0000001A,inset_1px_-14px_14px_0px_#0000002B] `
              : `${buttonBg} ${buttonTextColor} shadow-[inset_5px_-54px_22px_0px_#00000008,inset_3px_-30px_18px_0px_#0000001A,inset_1px_-14px_14px_0px_#0000002B]`
          }`}
        >
          {buttonText}
        </button>
      )}

      {showDivider && (
        <div
          className={`${dividerStyle} ${dividerSpacing} ${dividerHeight} ${dividerWidth} -ml-3 mx-auto relative z-10 ${
            isHovered ? "opacity-80" : "opacity-100"
          }`}
        ></div>
      )}

      {/* Features */}
      <ul className={`${featureSpacing} text-sm relative z-10 max-w-[312px]`}>
        {features.map((feature, idx) => (
          <li
            key={idx}
            className={`flex items-center ${featureSize} ${featureWeight} ${featureColor} ${featureClasses} ${featureIconSpacing} ${
              featureHoverEffect
                ? "transition-transform duration-300 hover:translate-x-1"
                : ""
            }`}
          >
            {showFeatureIcons && (
              <Image
                width={featureIconWidth}
                height={featureIconHeight}
                src={checkIconSrc}
                alt="check"
                className="mt-1"
              />
            )}
            <span className="flex-1 whitespace-normal lg:whitespace-nowrap">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard;
