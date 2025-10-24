"use client";

import React, { useEffect, useState } from "react";
import GlobalGraph from "@/app/shared/Graphs";
import { dashboard } from "@/app/api/Admin/dashboard-stats";

// Define types for the application data
interface Application {
  id: string;
  hostName: string;
  hostEmail: string;
  hostCompany: string;
  propertyName: string;
  propertyType: string;
  propertyAddress: string;
  propertyCity: string;
  status: string;
  currentStep: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  documentsCount: number;
  paymentStatus: string;
  priority: string;
  daysWaiting: number;
}

interface ApplicationsResponse {
  applications: Application[];
  total: number;
  period: {
    type: string;
    startDate: string;
    endDate: string;
  };
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
      moreInfoRequested: 0,
    },
    certifications: {
      active: 0,
      expired: 0,
      revoked: 0,
      expiring: 0,
      total: 0,
    },
    recentActivity: {
      applications: [],
    },
  });

  const [graphData, setGraphData] = useState<ApplicationStats>({
    labels: [],
    submitted: [],
    approved: [],
  });
  const [loading, setLoading] = useState(false);

  // Process applications data to generate graph data
  const processApplicationsData = (
    applications: Application[],
    period: "weekly" | "monthly" | "yearly"
  ): ApplicationStats => {
    const filteredApplications = applications.filter(
      (app) => app.submittedAt && app.submittedAt !== "2025-10-23T10:18:34.494Z" // Filter out placeholder dates
    );

    if (period === "weekly") {
      // Group by day of week for weekly view
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const submitted = new Array(7).fill(0);
      const approved = new Array(7).fill(0);

      filteredApplications.forEach((app: Application) => {
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
        approved,
      };
    }

    if (period === "monthly") {
      // Group by week for monthly view
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const submitted = new Array(4).fill(0);
      const approved = new Array(4).fill(0);

      filteredApplications.forEach((app: Application) => {
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
        approved,
      };
    }

    // Yearly view - group by month
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const submitted = new Array(12).fill(0);
    const approved = new Array(12).fill(0);

    filteredApplications.forEach((app: Application) => {
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
      approved,
    };
  };

  // Fetch dashboard stats (for certifications and general data)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, graphResponse] = await Promise.all([
          dashboard.getStats(),
          dashboard.getDashboard(range), // Pass the current range to the API
        ]);

        // Set main dashboard data
        setData({
          applications: {
            total: statsResponse.data.applications.total,
            pending: statsResponse.data.applications.pending,
            underReview: statsResponse.data.applications.underReview,
            approved: statsResponse.data.applications.approved,
            rejected: statsResponse.data.applications.rejected,
            moreInfoRequested:
              statsResponse.data.applications.moreInfoRequested,
          },
          certifications: {
            active: statsResponse.data.certifications.active,
            expired: statsResponse.data.certifications.expired,
            revoked: statsResponse.data.certifications.revoked,
            expiring: statsResponse.data.certifications.expiringSoon,
            total: statsResponse.data.certifications.total,
          },
          recentActivity: {
            applications: statsResponse.data.recentActivity
              .applications as Application[],
          },
        });

        // Process the applications data to generate graph data
        const processedGraphData = processApplicationsData(
          graphResponse.data.applications,
          range
        );
        setGraphData(processedGraphData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Initial load

  // Fetch graph data when range changes
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const graphResponse = await dashboard.getDashboard(range);

        // Process the applications data to generate graph data
        const processedGraphData = processApplicationsData(
          graphResponse.data.applications,
          range
        );
        setGraphData(processedGraphData);
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [range]); // Re-fetch when range changes

  // Handle range change
  const handleRangeChange = (newRange: "weekly" | "monthly" | "yearly") => {
    setRange(newRange);
  };

  // Add this debug code before return
  console.log("Current certifications data:", {
    total: data.certifications.total,
    active: data.certifications.active,
    expiring: data.certifications.expiring,
    revoked: data.certifications.revoked,
    expired: data.certifications.expired,
  });

  console.log("Current graph data:", {
    labels: graphData.labels,
    submitted: graphData.submitted,
    approved: graphData.approved,
    range: range,
  });

  console.log("Graph data arrays:", {
    submittedLength: graphData.submitted.length,
    approvedLength: graphData.approved.length,
    labelsLength: graphData.labels.length,
    submittedSum: graphData.submitted.reduce((a, b) => a + b, 0),
    approvedSum: graphData.approved.reduce((a, b) => a + b, 0),
  });

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
                  <span className="text-[#FFFFFFCC] text-[14px] leading-[18px] font-medium">
                    Submitted
                  </span>
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
                  onClick={() => handleRangeChange(r)}
                  disabled={loading}
                  className={`px-4 py-2 cursor-pointer font-regular text-[12px] leading-4 rounded-lg transition ${
                    range === r
                      ? "bg-[#EFFC76] text-black"
                      : "border border-[#FFFFFF1F] text-[#FFFFFFCC] hover:bg-[#252525]"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading && range === r ? (
                    <span>Loading...</span>
                  ) : (
                    r.charAt(0).toUpperCase() + r.slice(1)
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 280 }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white">Loading chart data...</div>
              </div>
            ) : graphData.labels.length > 0 ? (
              <GlobalGraph
                type="bar"
                stacked
                labels={graphData.labels}
                datasets={[
                  {
                    label: "Submitted",
                    data: graphData.submitted,
                    backgroundColor: "#EFFC76",
                  },
                  {
                    label: "Approved",
                    data: graphData.approved,
                    backgroundColor: "#52525b",
                  },
                ]}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white">
                  No data available for the selected period
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certification Distribution - Doughnut Chart */}
        <div className="w-full lg:w-[40%] bg-[#121315] rounded-2xl shadow-lg p-5 flex flex-col relative overflow-visible">
          <h2 className="text-[16px] leading-5 font-semibold text-white">
            Certification Distribution
          </h2>

          <div className="flex-1 flex items-center w-full h-full justify-center relative overflow-visible">
            <div
              style={{
                height: 220,
                width: "100%",
                position: "relative",
                overflow: "visible",
              }}
            >
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
                      data.certifications.expired,
                    ],
                    backgroundColor: [
                      "#EFFC76",
                      "#52525b",
                      "#fb923c",
                      "#22c55e",
                    ],
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
