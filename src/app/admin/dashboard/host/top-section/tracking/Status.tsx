'use client'
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { dashboard } from "@/app/api/Admin/dashboard-stats"; 

export default function Status() {
  const [data, setData] = useState({
    applications: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    certifications: {
      active: 0,
      expired: 0
    }
  });

  useEffect(() => {
    const getStats = async () => {
      try {
        const response = await dashboard.getStats();
        setData({
          applications: {
            total: response.data.applications.total || 0,
            pending: response.data.applications.pending || 0,
            approved: response.data.applications.approved || 0,
            rejected: response.data.applications.rejected || 0
          },
          certifications: {
            active: response.data.certifications.active || 0,
            expired: response.data.certifications.expired || 0
          }
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };
    
    getStats();
  }, []); // Added dependency array

  const Credentials = [
    {
      id: 1,
      img: "/images/manager.svg",
      val: data.applications.total.toString(),
      title: "Total Applications"
    },
    {
      id: 2,
      img: "/images/pending.svg",
      val: data.applications.pending.toString(),
      title: "Pending Applications"
    },
    {
      id: 3,
      img: "/images/actives.svg",
      val: data.certifications.active.toString(),
      title: "Active Certificates"
    },
    {
      id: 4,
      img: "/images/revoke.svg",
      val: data.certifications.expired.toString(),
      title: "Expired Certificates"
    },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-[17px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 w-full lg:grid-cols-4 gap-3 pt-5 flex-wrap lg:flex-nowrap justify-between">
        {Credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image 
                src={item.img} 
                alt={item.title} 
                width={48} 
                height={48}  
                style={{ width: "auto", height: "auto" }}
              />
              <div>
                <h2 className="text-[20px] font-semibold leading-[24px] text-white">{item.val}</h2>
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}