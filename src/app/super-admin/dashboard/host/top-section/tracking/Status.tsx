// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { dashboardApi } from "@/app/api/super-admin/dashboard";

// export default function Status() {
  
//   const [statsData, setStatsData] = useState<any>(null);
//   const [revenueData, setRevenueData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
 
//   // Fetch data from APIs
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [statsResponse, revenueResponse] = await Promise.all([
//           dashboardApi.getStats(),
//           dashboardApi.getRevenue()
//         ]);

//         if (statsResponse.data) {
//           setStatsData(statsResponse.data.data);
//         }

//         if (revenueResponse.data) {
//           setRevenueData(revenueResponse.data.data);
//         }
//       } catch (err) {
//         setError("Failed to fetch dashboard data");
//         console.error("Error fetching dashboard data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

  

//   const Credentials = [
//     {
//       id: 1,
//       img: "/images/status1.png",
//       val: statsData?.totalHosts?.count ?? "0",
//       title: "Total Hosts",
//       growthPercent: statsData?.totalHosts?.percentageChange ?? "+0%",
//       growthText: "growth compared to last month",
//       color: "text-lime-400",
//       bgColor: "bg-lime-900/30",
//     },
//     {
//       id: 2,
//       img: "/images/status2.png",
//       val: statsData?.totalAdmins?.count ?? "0",
//       title: "Total Admins",
//       growthPercent: statsData?.totalAdmins?.percentageChange ?? "+0%",
//       growthText: "growth compared to last month",
//       color: "text-lime-400",
//       bgColor: "bg-lime-900/30",
//     },
//     {
//       id: 3,
//       img: "/images/status3.png",
//       val: statsData?.activeCertificates?.count ?? "0",
//       title: "Active Certificates",
//       growthPercent: statsData?.activeCertificates?.percentageChange ?? "+0%",
//       growthText: "increase in certifications last month",
//       color: "text-lime-400",
//       bgColor: "bg-lime-900/30",
//     },
//     {
//       id: 4,
//       img: "/images/revoke.svg",
//       val: statsData?.expiredCertificates?.count ?? "0",
//       title: "Expired Certificates",
//       growthPercent: statsData?.expiredCertificates?.percentageChange ?? "+0%",
//       growthText: "expired certifications last month",
//       color: "text-red-400",
//       bgColor: "bg-red-900/30",
//     },
//   ];

//   // Format currency
//   const formatCurrency = (amount: number, currency: string = "USD") => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currency,
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col gap-6 w-full">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:auto-rows-[132px]">
//           {[...Array(5)].map((_, index) => (
//             <div
//               key={index}
//               className="relative group rounded-2xl bg-[#121315] border border-[#1E1F22] p-4 transition-all duration-300 overflow-hidden animate-pulse"
//             >
//               <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
//               <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
//               <div className="h-3 bg-gray-700 rounded w-3/4"></div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center p-8 text-red-400">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-6 w-full">
//       {/* ✅ Grid Layout */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:auto-rows-[132px]">
//         {Credentials.map((item) => (
//           <div
//             key={item.id}
//             className="relative group rounded-2xl bg-[#121315] border border-[#1E1F22] p-4 transition-all duration-300 overflow-hidden"
//           >
//             {/* Icon and Title */}
//             <div className="flex justify-between items-center">
//               <h3 className="text-[14px] font-normal leading-[18px] text-[#FFFFFFCC] -mt-5">
//                 {item.title}
//               </h3>

//               {/* ✅ Fixed-size image wrapper */}
//               <div className="w-10 h-10 flex justify-center items-center overflow-hidden">
//                 <Image
//                   src={item.img}
//                   alt={item.title}
//                   width={48}
//                   height={48}
//                   className="object-contain opacity-80 group-hover:opacity-100 transition-all duration-300"
//                 />
//               </div>
//             </div>

//             {/* Value */}
//             <h2 className="text-[24px] leading-7 font-semibold text-white mb-4">
//               {item.val}
//             </h2>

//             {/* Growth Info */}
//             <p className="text-xs flex items-center gap-1 -mt-2">
//               <span
//                 className={`
//                   ${item.color} 
//                   bg-[rgba(255,255,255,0.08)] 
//                   rounded 
//                   px-2 
//                   py-1 
//                   flex 
//                   justify-center 
//                   items-center 
//                   font-semibold 
//                   backdrop-blur-sm
//                 `}
//               >
//                 {item.growthPercent}
//               </span>
//               <span className="text-[#FFFFFFCC] text-[14px] font-normal leading-[18px]">
//                 {item.growthText}
//               </span>
//             </p>
//           </div>
//         ))}

//         {/* Revenue Card */}
//         <div className="lg:col-start-3 lg:row-start-1 lg:row-span-2 rounded-2xl bg-[#121315] border border-[#1E1F22] px-3 pt-5 pb-3 flex flex-col items-start justify-start transition-all duration-300 overflow-hidden relative">
//           {/* Revenue Content */}
//           <div className="relative z-10 text-start w-full">
//             <h2 className="text-[28px] leading-8 font-semibold">
//               {/* <span className="text-[#EFFC76]">$ </span> */}
//               <span className="text-white">
//                 {revenueData?.totalRevenue?.amount 
//                   ? formatCurrency(revenueData.totalRevenue.amount, revenueData.totalRevenue.currency)
//                   : "$0"}
//               </span>
//             </h2>

//             <p className="text-[12px] leading-4 font-normal text-[#FFFFFF99] mt-3">
//               Revenue compared to last month:{" "}
//               <span className={`font-medium text-[14px] leading-[18px] ${
//                 revenueData?.comparison?.percentageChange?.startsWith('+') 
//                   ? 'text-lime-400' 
//                   : 'text-[#FF3F3F]'
//               }`}>
//                 {revenueData?.comparison?.percentageChange ?? "0.00"}%
//               </span>
//             </p>
//           </div>

//           <div className="relative w-full mt-3 rounded-[12px] border-[#FFFFFF14] overflow-hidden z-0 pb-12">
//             <video autoPlay loop muted className="w-full h-43 object-cover">
//               <source src="/videos/home.mp4" type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>

//             <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 z-20">
//               <Image
//                 src="/images/animation-status.png"
//                 alt="Revenue"
//                 width={189}
//                 height={189}
//                 className="animate-[spinFan_6s_linear_infinite] transition-all duration-300"
//               />
//             </div>
//           </div>

//           <style jsx>{`
//             @keyframes spinFan {
//               from {
//                 transform: rotate(0deg);
//               }
//               to {
//                 transform: rotate(360deg);
//               }
//             }
//           `}</style>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { dashboardApi } from "@/app/api/super-admin/dashboard";

// Define interfaces for the API responses
interface StatItem {
  count: number;
  percentageChange: string;
}

interface StatsData {
  totalHosts: StatItem;
  totalAdmins: StatItem;
  activeCertificates: StatItem;
  expiredCertificates: StatItem;
}

interface RevenueData {
  totalRevenue: {
    amount: number;
    currency: string;
  };
  comparison: {
    percentageChange: string;
  };
}

interface CredentialItem {
  id: number;
  img: string;
  val: string;
  title: string;
  growthPercent: string;
  growthText: string;
  color: string;
  bgColor: string;
}

export default function Status() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsResponse, revenueResponse] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRevenue()
        ]);

        if (statsResponse.data?.data) {
          setStatsData(statsResponse.data.data as StatsData);
        }

        if (revenueResponse.data?.data) {
          setRevenueData(revenueResponse.data.data as RevenueData);
        }
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const Credentials: CredentialItem[] = [
    {
      id: 1,
      img: "/images/status1.png",
      val: statsData?.totalHosts?.count?.toString() ?? "0",
      title: "Total Hosts",
      growthPercent: statsData?.totalHosts?.percentageChange ?? "+0%",
      growthText: "growth compared to last month",
      color: "text-lime-400",
      bgColor: "bg-lime-900/30",
    },
    {
      id: 2,
      img: "/images/status2.png",
      val: statsData?.totalAdmins?.count?.toString() ?? "0",
      title: "Total Admins",
      growthPercent: statsData?.totalAdmins?.percentageChange ?? "+0%",
      growthText: "growth compared to last month",
      color: "text-lime-400",
      bgColor: "bg-lime-900/30",
    },
    {
      id: 3,
      img: "/images/status3.png",
      val: statsData?.activeCertificates?.count?.toString() ?? "0",
      title: "Active Certificates",
      growthPercent: statsData?.activeCertificates?.percentageChange ?? "+0%",
      growthText: "increase in certifications last month",
      color: "text-lime-400",
      bgColor: "bg-lime-900/30",
    },
    {
      id: 4,
      img: "/images/revoke.svg",
      val: statsData?.expiredCertificates?.count?.toString() ?? "0",
      title: "Expired Certificates",
      growthPercent: statsData?.expiredCertificates?.percentageChange ?? "+0%",
      growthText: "expired certifications last month",
      color: "text-red-400",
      bgColor: "bg-red-900/30",
    },
  ];

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:auto-rows-[132px]">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="relative group rounded-2xl bg-[#121315] border border-[#1E1F22] p-4 transition-all duration-300 overflow-hidden animate-pulse"
            >
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ✅ Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:auto-rows-[132px]">
        {Credentials.map((item) => (
          <div
            key={item.id}
            className="relative group rounded-2xl bg-[#121315] border border-[#1E1F22] p-4 transition-all duration-300 overflow-hidden"
          >
            {/* Icon and Title */}
            <div className="flex justify-between items-center">
              <h3 className="text-[14px] font-normal leading-[18px] text-[#FFFFFFCC] -mt-5">
                {item.title}
              </h3>

              {/* ✅ Fixed-size image wrapper */}
              <div className="w-10 h-10 flex justify-center items-center overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.title}
                  width={48}
                  height={48}
                  className="object-contain opacity-80 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Value */}
            <h2 className="text-[24px] leading-7 font-semibold text-white mb-4">
              {item.val}
            </h2>

            {/* Growth Info */}
            <p className="text-xs flex items-center gap-1 -mt-2">
              <span
                className={`
                  ${item.color} 
                  bg-[rgba(255,255,255,0.08)] 
                  rounded 
                  px-2 
                  py-1 
                  flex 
                  justify-center 
                  items-center 
                  font-semibold 
                  backdrop-blur-sm
                `}
              >
                {item.growthPercent}
              </span>
              <span className="text-[#FFFFFFCC] text-[14px] font-normal leading-[18px]">
                {item.growthText}
              </span>
            </p>
          </div>
        ))}

        {/* Revenue Card */}
        <div className="lg:col-start-3 lg:row-start-1 lg:row-span-2 rounded-2xl bg-[#121315] border border-[#1E1F22] px-3 pt-5 pb-3 flex flex-col items-start justify-start transition-all duration-300 overflow-hidden relative">
          {/* Revenue Content */}
          <div className="relative z-10 text-start w-full">
            <h2 className="text-[28px] leading-8 font-semibold">
              <span className="text-white">
                {revenueData?.totalRevenue?.amount 
                  ? formatCurrency(revenueData.totalRevenue.amount, revenueData.totalRevenue.currency)
                  : "$0"}
              </span>
            </h2>

            <p className="text-[12px] leading-4 font-normal text-[#FFFFFF99] mt-3">
              Revenue compared to last month:{" "}
              <span className={`font-medium text-[14px] leading-[18px] ${
                revenueData?.comparison?.percentageChange?.startsWith('+') 
                  ? 'text-lime-400' 
                  : 'text-[#FF3F3F]'
              }`}>
                {revenueData?.comparison?.percentageChange ?? "0.00"}%
              </span>
            </p>
          </div>

          <div className="relative w-full mt-3 rounded-[12px] border-[#FFFFFF14] overflow-hidden z-0 pb-12">
            <video autoPlay loop muted className="w-full h-43 object-cover">
              <source src="/videos/home.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 z-20">
              <Image
                src="/images/animation-status.png"
                alt="Revenue"
                width={189}
                height={189}
                className="animate-[spinFan_6s_linear_infinite] transition-all duration-300"
              />
            </div>
          </div>

          <style jsx>{`
            @keyframes spinFan {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}