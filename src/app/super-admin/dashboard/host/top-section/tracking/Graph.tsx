"use client";

import React, { useState } from "react";
import GlobalGraph from "@/app/shared/Graphs";

export default function Graph() {
  const [range1, setRange1] = useState<"weekly" | "monthly" | "yearly">("yearly");
  const [range2, setRange2] = useState<"weekly" | "monthly" | "yearly">("yearly");

  const propertyListingData = {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      certified: [450, 520, 380, 610, 550, 480, 670],
      listed: [280, 350, 420, 310, 390, 450, 380],
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      certified: [1800, 2200, 1950, 2400],
      listed: [1200, 1500, 1350, 1600],
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      certified: [2500, 1800, 2800, 2600, 1400, 1600, 1900, 2300, 3000, 1500, 2600, 2400],
      listed: [1400, 1100, 1900, 1600, 1000, 1300, 800, 1200, 1800, 700, 1600, 1400],
    },
  };
  const revenueData = {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      revenue: [8000, 9500, 7200, 11000, 10500, 8800, 12500],
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      revenue: [35000, 42000, 38000, 45000],
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      revenue: [20000, 25000, 32000, 30000, 35000, 28000, 42000, 45000, 47000, 44000, 43000, 39000],
    },
  };

  const activePropertyData = propertyListingData[range1];
  const activeRevenueData = revenueData[range2];

  return (
    <div className="pt-5 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">

        <div className="w-full bg-[#121315] p-5 rounded-2xl shadow-lg overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4 sm:gap-0">
            <div>
              <h2 className="text-[16px] leading-5 font-semibold text-white">
                Property Listing over Time
              </h2>
              <div className="flex gap-8 items-center mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-[1.5px] h-5 bg-[#EFFC76] rounded-full" />
                  <span className="text-[#FFFFFFCC] text-[14px] leading-[18px] font-medium">
                    Certified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[1.5px] h-5 bg-[#52525b] rounded-full" />
                  <span className="text-[#FFFFFFCC]">Property Listed</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {(["weekly", "monthly", "yearly"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange1(r)}
                  className={`px-4 py-2 cursor-pointer font-regular text-[12px] leading-4 rounded-lg transition ${range1 === r
                    ? "bg-[#EFFC76] text-black"
                    : "border border-[#FFFFFF1F] text-[#FFFFFFCC] hover:bg-[#252525]"
                    }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <GlobalGraph
            type="bar"
            stacked
            showStripedBars
            
            barThickness={range1 === "yearly" ? 30 : range1 === "monthly" ? 40 : 35}
            barGap={20}
            roundedBars
            showYAxis={true}
            tooltipVariant="percentage"
            labels={activePropertyData.labels}
            datasets={[
              {
                label: "Certified",
                data: activePropertyData.certified,
                backgroundColor: "#EFFC76",
              },
              {
                label: "Property Listed",
                data: activePropertyData.listed,
                backgroundColor: "#52525b",
              },
            ]}
          />
        </div>

        <div className="w-full bg-[#121315] rounded-2xl shadow-lg p-5 flex flex-col relative overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4 sm:gap-0">
            <h2 className="text-[16px] leading-5 font-semibold text-white">
              Revenue Insights
            </h2>

            <div className="flex gap-2">
              {(["weekly", "monthly", "yearly"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange2(r)}
                  className={`px-4 py-2 cursor-pointer font-regular text-[12px] leading-4 rounded-lg transition ${range2 === r
                    ? "bg-[#EFFC76] text-black"
                    : "border border-[#FFFFFF1F] text-[#FFFFFFCC] hover:bg-[#252525]"
                    }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center w-full h-full justify-center relative overflow-visible">
            <div
              style={{
                height: 257,
                width: "100%",
                position: "relative",
                overflow: "visible",
              }}
            >
              <GlobalGraph
                type="line"
                labels={activeRevenueData.labels}
                datasets={[
                  {
                    label: "Revenue",
                    data: activeRevenueData.revenue,
                    borderColor: "#D4FB64",
                    backgroundColor: "rgba(212, 251, 100, 0.3)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}