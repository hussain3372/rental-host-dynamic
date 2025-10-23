"use client";

import React, { useEffect, useState } from "react";
import GlobalGraph from "@/app/shared/Graphs";
import { dashboard } from "@/app/api/Admin/dashboard-stats";

// Define types for the application data
interface Application {
  submittedAt: string;
  status: string;
}

interface ApplicationStats {
  labels: string[];
  submitted: number[];
  approved: number[];
}

interface DashboardData {
  applications: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    moreInfoRequested: number;
  };
  certifications: {
    active: number;
    expired: number;
    revoked: number;
    expiring: number;
    total: number;
  };
  recentActivity: {
    applications: Application[];
  };
}

export default function Graph() {
  const [range, setRange] = useState<"weekly" | "monthly" | "yearly">("yearly");
  const [data, setData] = useState<DashboardData>({
    applications: {
      total: 0,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      moreInfoRequested: 0
    },
    certifications: {
      active: 0,
      expired: 0,
      revoked: 0,
      expiring: 0,
      total: 0
    },
    recentActivity: {
      applications: []
    }
  });

useEffect(() => {
  const getStats = async () => {
    try {
      const response = await dashboard.getStats();
      
      // Direct mapping from your API response structure
      setData({
        applications: {
          total: response.data.applications.total,
          pending: response.data.applications.pending,
          underReview: response.data.applications.underReview,
          approved: response.data.applications.approved,
          rejected: response.data.applications.rejected,
          moreInfoRequested: response.data.applications.moreInfoRequested
        },
        certifications: {
          active: response.data.certifications.active,
          expired: response.data.certifications.expired,
          revoked: response.data.certifications.revoked,
          expiring: response.data.certifications.expiringSoon, 
          total: response.data.certifications.total
        },
        recentActivity: {
          applications: response.data.recentActivity.applications
        }
      });
      
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };
  
  getStats();
}, []);

  // Generate application statistics by status over time
  const generateApplicationStats = (range: "weekly" | "monthly" | "yearly"): ApplicationStats => {
    const recentApps = data.recentActivity.applications;
    
    if (range === "weekly") {
      // Group by day of week for weekly view
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const submitted = new Array(7).fill(0);
      const approved = new Array(7).fill(0);
      
      recentApps.forEach((app: Application) => {
        const date = new Date(app.submittedAt);
        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        // Adjust to make Monday (1) the first day
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        
        if (adjustedIndex >= 0 && adjustedIndex < 7) {
          submitted[adjustedIndex]++;
          if (app.status === "APPROVED") {
            approved[adjustedIndex]++;
          }
        }
      });
      
      return {
        labels: days,
        submitted,
        approved
      };
    }
    
    if (range === "monthly") {
      // Group by week for monthly view
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const submitted = new Array(4).fill(0);
      const approved = new Array(4).fill(0);
      
      recentApps.forEach((app: Application) => {
        const date = new Date(app.submittedAt);
        const dayOfMonth = date.getDate();
        const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
        
        submitted[weekIndex]++;
        if (app.status === "APPROVED") {
          approved[weekIndex]++;
        }
      });
      
      return {
        labels: weeks,
        submitted,
        approved
      };
    }
    
    // Yearly view - group by month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const submitted = new Array(12).fill(0);
    const approved = new Array(12).fill(0);
    
    recentApps.forEach((app: Application) => {
      const date = new Date(app.submittedAt);
      const monthIndex = date.getMonth(); // 0 = January, 11 = December
      
      if (monthIndex >= 0 && monthIndex < 12) {
        submitted[monthIndex]++;
        if (app.status === "APPROVED") {
          approved[monthIndex]++;
        }
      }
    });
    
    return {
      labels: months,
      submitted,
      approved
    };
  };

  // Add this debug code before return
console.log('Current certifications data:', {
  total: data.certifications.total,
  active: data.certifications.active,
  expiring: data.certifications.expiring,
  revoked: data.certifications.revoked,
  expired: data.certifications.expired
});


  const applicationData = generateApplicationStats(range);

  

  return (
    <div className="pt-5 text-white">
      <div className="flex flex-col md:flex-col lg:flex-row gap-6 w-full">

        {/* Applications Over Time - Stacked Bar Chart */}
        <div className="w-full lg:flex-1 bg-[#121315] p-5 rounded-2xl shadow-lg overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4 sm:gap-0">
            <div>
              <h2 className="text-[16px] leading-5 font-semibold text-white">
                Applications Over Time
              </h2>
              <div className="flex gap-8 items-center mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-[1.5px] h-5 bg-[#EFFC76] rounded-full" />
                  <span className="text-[#FFFFFFCC] text-[14px] leading-[18px] font-medium">Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[1.5px] h-5 bg-[#52525b] rounded-full" />
                  <span className="text-[#FFFFFFCC]">Approved</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {(["weekly", "monthly", "yearly"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 cursor-pointer font-regular text-[12px] leading-4 rounded-lg transition ${range === r
                    ? "bg-[#EFFC76] text-black"
                    : "border border-[#FFFFFF1F] text-[#FFFFFFCC] hover:bg-[#252525]"
                    }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 280 }}>
            <GlobalGraph
              type="bar"
              stacked
              labels={applicationData.labels}
              datasets={[
                {
                  label: "Submitted",
                  data: applicationData.submitted,
                  backgroundColor: "#EFFC76",
                },
                {
                  label: "Approved",
                  data: applicationData.approved,
                  backgroundColor: "#52525b",
                },
              ]}
            />
          </div>
        </div>

        {/* Certification Distribution - Doughnut Chart */}
        <div className="w-full lg:w-[40%] bg-[#121315] rounded-2xl shadow-lg p-5 flex flex-col relative overflow-visible">
          <h2 className="text-[16px] leading-5 font-semibold text-white">
            Certification Distribution
          </h2>

         <div className="flex-1 flex items-center w-full h-full justify-center relative overflow-visible">
            <div style={{ height: 220, width: "100%", position: "relative", overflow: "visible" }}>
              <GlobalGraph
                key={data.certifications.total}
                type="doughnut"
                labels={["Active", "Expiring", "Revoked", "Expired"]}
                datasets={[
                  {
                    label: "Certifications",
                    data: [
                      data.certifications.active,
                      data.certifications.expiring,
                      data.certifications.revoked,
                      data.certifications.expired
                    ],
                    backgroundColor: ["#EFFC76", "#52525b", "#fb923c", "#22c55e"],
                  },
                ]}
                centerText={{ 
                  label: "Total", 
                  value: String(data.certifications.total),
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-[#FFFFFFCC] font-bold text-[12px] mt-8 place-items-center">
            <div className="flex items-center gap-3 mr-[6px]">
              <span className="w-[8px] h-[8px] rounded-full bg-[#EFFC76] flex-shrink-0" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-3 mr-1">
              <span className="w-[8px] h-[8px] rounded-full bg-[#52525b] flex-shrink-0" />
              <span>Expiring</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-[8px] h-[8px] rounded-full bg-[#22c55e] flex-shrink-0" />
              <span>Expired</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-[8px] h-[8px] rounded-full bg-[#fb923c] flex-shrink-0" />
              <span>Revoked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}