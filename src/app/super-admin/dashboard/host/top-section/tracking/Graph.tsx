"use client";

import React, { useState, useEffect } from "react";
import GlobalGraph from "@/app/shared/Graphs";
import { dashboardApi } from "@/app/api/super-admin/dashboard";

interface GraphDataItem {
  label?: string;
  month?: string; 
  year?: string;
  certificatesGenerated?: number;
  propertiesListed?: number;
  revenue?: number;
}

interface ApiResponse {
  data: GraphDataItem[];
  summary?: {
    totalRevenue?: number;
  };
}

export default function Graph() {
  const [range1, setRange1] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [range2, setRange2] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [propertyData, setPropertyData] = useState<ApiResponse | null>(null);
  const [revenueData, setRevenueData] = useState<ApiResponse | null>(null);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  // Fetch property insights data
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading1(true);
        setError1(null);
        const response = await dashboardApi.getPropertyInsights(range1);
        if (response.data) {
          setPropertyData(response.data as ApiResponse);
          console.log("Property data:", response.data);
        }
      } catch (err) {
        setError1("Failed to fetch property insights");
        console.error("Error fetching property insights:", err);
      } finally {
        setLoading1(false);
      }
    };

    fetchPropertyData();
  }, [range1]);

  // Fetch revenue insights data
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading2(true);
        setError2(null);
        const response = await dashboardApi.getRevenueInsights(range2);
        if (response.data) {
          setRevenueData(response.data);
          console.log("Revenue data:", response.data);
        }
      } catch (err) {
        setError2("Failed to fetch revenue insights");
        console.error("Error fetching revenue insights:", err);
      } finally {
        setLoading2(false);
      }
    };

    fetchRevenueData();
  }, [range2]);

  // Get the correct label field based on period type
  const getLabelField = (period: string) => {
    switch (period) {
      case "weekly":
        return "label";
      case "monthly":
        return "month";
      case "yearly":
        return "year";
      default:
        return "label";
    }
  };

  // Transform property data for graph with correct label field
  const transformPropertyData = () => {
    if (!propertyData?.data || !Array.isArray(propertyData.data)) {
      const defaultLabels = generateDefaultLabels(range1);
      return {
        labels: defaultLabels,
        certified: Array(defaultLabels.length).fill(0),
        listed: Array(defaultLabels.length).fill(0)
      };
    }

    const labelField = getLabelField(range1);
    const labels = propertyData.data.map((item: GraphDataItem) => {
      const value = item[labelField as keyof GraphDataItem] || item.label || item.month || item.year;
      return value?.toString() || "";
    });
    
    const certified = propertyData.data.map((item: GraphDataItem) => item.certificatesGenerated || 0);
    const listed = propertyData.data.map((item: GraphDataItem) => item.propertiesListed || 0);

    console.log("Property graph data:", { 
      labels, 
      certified, 
      listed, 
      labelField, 
      range: range1,
      dataLength: propertyData.data.length 
    });

    return {
      labels,
      certified,
      listed
    };
  };

  // Transform revenue data for graph with correct label field
  const transformRevenueData = () => {
    if (!revenueData?.data || !Array.isArray(revenueData.data)) {
      const defaultLabels = generateDefaultLabels(range2);
      return {
        labels: defaultLabels,
        revenue: Array(defaultLabels.length).fill(0)
      };
    }

    const labelField = getLabelField(range2);
    const labels = revenueData.data.map((item: GraphDataItem) => {
      const value = item[labelField as keyof GraphDataItem] || item.label || item.month || item.year;
      return value?.toString() || "";
    });
    
    const revenue = revenueData.data.map((item: GraphDataItem) => item.revenue || 0);

    console.log("Revenue graph data:", { 
      labels, 
      revenue, 
      labelField, 
      range: range2,
      dataLength: revenueData.data.length 
    });

    return {
      labels,
      revenue
    };
  };

  // Generate default labels for each period type
  const generateDefaultLabels = (period: string) => {
    switch (period) {
      case "weekly":
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      case "monthly":
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      case "yearly":
        return ["2021", "2022", "2023", "2024", "2025"];
      default:
        return Array.from({ length: 7 }, (_, i) => `Label ${i + 1}`);
    }
  };

  const activePropertyData = transformPropertyData();
  const activeRevenueData = transformRevenueData();

  console.log("Graph states:", {
    range1,
    range2,
    propertyLabels: activePropertyData.labels,
    revenueLabels: activeRevenueData.labels,
    propertyDataLength: propertyData?.data?.length,
    revenueDataLength: revenueData?.data?.length
  });

  if (loading1 && loading2) {
    return (
      <div className="pt-5 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="w-full bg-[#121315] p-5 rounded-2xl shadow-lg animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-5 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">

        {/* Property Listing Graph */}
        <div className="w-full bg-[#121315] p-5 rounded-2xl shadow-lg overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4 sm:gap-0">
            <div>
              <h2 className="text-[16px] leading-5 font-semibold text-white">
                Property Listing over Time
              </h2>
              {error1 ? (
                <p className="text-red-400 text-sm mt-2">{error1}</p>
              ) : (
                <div className="flex gap-8 items-center mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-[1.5px] h-5 bg-[#EFFC76] rounded-full" />
                    <span className="text-[#FFFFFFCC] text-[14px] leading-[18px] font-medium">
                      Certified 
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[1.5px] h-5 bg-[#52525b] rounded-full" />
                    <span className="text-[#FFFFFFCC]">
                      Property Listed
                    </span>
                  </div>
                </div>
              )}
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

          {loading1 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Loading property data...
            </div>
          ) : error1 ? (
            <div className="h-64 flex items-center justify-center text-red-400">
              {error1}
            </div>
          ) : (
            <GlobalGraph
              type="bar"
              stacked
              showStripedBars
              barThickness={range1 === "yearly" ? 20 : range1 === "monthly" ? 20 : 35}
              barGap={range1 === "yearly" ? 5 : 10}
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
          )}
        </div>

        {/* Revenue Insights Graph */}
        <div className="w-full bg-[#121315] rounded-2xl shadow-lg p-5 flex flex-col relative overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4 sm:gap-0">
            <div>
              <h2 className="text-[16px] leading-5 font-semibold text-white">
                Revenue Insights
              </h2>
              {error2 ? (
                <p className="text-red-400 text-sm mt-2">{error2}</p>
              ) : (
                <p className="text-[#FFFFFFCC] text-sm mt-2">
                  Total: ${revenueData?.summary?.totalRevenue?.toLocaleString() || 0}
                </p>
              )}
            </div>

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

          {loading2 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Loading revenue data...
            </div>
          ) : error2 ? (
            <div className="h-64 flex items-center justify-center text-red-400">
              {error2}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}