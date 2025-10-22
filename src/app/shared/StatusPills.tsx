"use client";
import "./StatusPill.css";
import React, { CSSProperties } from "react";

type Variant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "urgent"
  | "info"
  | "flagged"
  | "accurate"
  | "purple";

interface StatusPillProps {
  status?: string; // text label
  variant?: Variant; // must be passed dynamically
  textColor?: string;
  backgroundColor?: string;
  showRadio?: boolean;
  children?: React.ReactNode;
}

const variantColors: Record<Variant, string> = {
  default: "#424242",
  success: "#EFFC76",
  warning: "#FFB52B",
  error: "#FF3F3F",
  urgent: "#FFB52B",
  info: "#007BFF",
  flagged: "#FFA424",
  accurate: "#00C851",
  purple: "#D24AFF",
};

const StatusPill: React.FC<StatusPillProps> = ({
  status,
  variant = "default", // default fallback
  textColor = "",
  backgroundColor = "",
  showRadio = false,
  children,
}) => {
  const radioStyle: CSSProperties = {
    accentColor: variantColors[variant] || "#424242",
    marginRight: "8px",
  };

  const customStyles: CSSProperties = {};
  if (textColor) customStyles.color = textColor;
  if (backgroundColor) customStyles.backgroundColor = backgroundColor;

  return (
    <span className={`status-pill variant-${variant}`} style={customStyles}>
      {showRadio && <input type="radio" className="status-radio" style={radioStyle} />}
      {status || children}
    </span>
  );
};

export default StatusPill;
