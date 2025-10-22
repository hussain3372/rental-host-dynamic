import React from "react";
import Certification from "./Certification";
import Applications from "./Applications";

export default function page() {
  return (
    <div className="  space-y-[20px] z-[100000]">
      <Certification />
      <Applications />
    </div>
  );
}
