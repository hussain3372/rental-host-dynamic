import React from "react";
import Status from "./host/top-section/tracking/Status";
import Tracking from "./host/top-section/tracking/Tracking";
export default function page() {
  return (
    <>
      <div className="  relative">
        <Status />
        <Tracking />
      </div>
    </>
  );
}
