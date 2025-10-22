"use client";
import { useState } from "react";
import Image from "next/image";
import Button from "@/app/shared/Button";

const notifications = [
    {
        id: 1,
        title: "Application Submitted",
        message:
            'Your application for the "Occupational Safety Certificate" has been successfully submitted. Our team will review your documents and notify you once the evaluation process is complete.',
        time: "2m ago",
        status: "unread",
        image: "/images/notification1.png",
        highlight: true,
    },
    {
        id: 2,
        title: "Application Under Review",
        message:
            "Your application is currently under review by the certification committee. This step may take 5–7 working days. You will be informed once the review process is finalized.",
        time: "2h ago",
        status: "read",
        image: "/images/notification2.png",
        highlight: false,
    },
    {
        id: 3,
        title: "Additional Information Required",
        message:
            "Your application requires additional documentation to proceed. Please upload a copy of your identity verification within the next 3 days to avoid delays in the approval process.",
        time: "2h ago",
        status: "read",
        image: "/images/notification3.png",
        highlight: true,
    },
    {
        id: 4,
        title: "Application Submitted",
        message:
            'Your application for the "Occupational Safety Certificate" has been successfully submitted. Our team will review your documents and notify you once the evaluation process is complete.',
        time: "2h ago",
        status: "read",
        image: "/images/notification4.png",
        highlight: false,
    },
];

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [allRead, setAllRead] = useState(false);

    const filteredNotifications = notifications.filter((notif) => {
        if (activeTab === "all") return true;
        if (activeTab === "unread") return notif.status === "unread";
        if (activeTab === "read") return notif.status === "read";
        return true;
    });

    return (
        <div className=" text-white  pb-[190px] ">

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-[20px] leading-[24px] font-semibold">Notifications</h1>

            </div>

            <p className="text-4 leading-5 text-[#FFFFFF99] font-normal mb-[40px]">
                Stay updated with your latest application and certificate activities.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                <div className="flex flex-wrap gap-3">
                    {["all", "unread", "read"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm sm:text-base font-medium capitalize leading-5
                                      ${activeTab === tab
                                    ? "bg-[rgba(239,252,118,0.08)] border border-[rgba(239,252,118,0.60)] text-white"
                                    : "bg-[#121315] text-gray-300"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>


                <div className="flex items-center gap-5 px-4 py-2 rounded-md bg-[#121315] cursor-pointer max-w-[201px]">
                    <label className="relative w-[18px] h-[18px] flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={allRead}
                            onChange={() => setAllRead(!allRead)}
                            className="appearance-none w-full h-full rounded-[4px] border border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.12)] cursor-pointer shadow-[inset_1px_1px_4px_rgba(0,0,0,0.2)] checked:bg-[rgba(239,252,118,0.08)] checked:border-[rgba(239,252,118,0.6)]"
                        />
                        {allRead && (
                            <svg
                                className="w-3 h-3 absolute pointer-events-none"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </label>
                    <span className="text-sm sm:text-base font-medium leading-5 text-white">
                        Mark All as Read
                    </span>
                </div>


            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    //  Global Empty State 
                    <div className="flex flex-col items-center justify-center py-20">
                        <Image
                            src="/images/notify-empty.png"
                            alt="No Notifications"
                            width={220}
                            height={220}
                        />
                        <span className="mt-8 text-white text-[24px] leading-[28px] font-medium">
                            No notifications available
                        </span>
                        <p className="mt-3 font-normal text-[#FFFFFF99] text-[18px] leading-[22px] font-normal max-w-[690px]">
                            Once you start submitting applications, you will receive notifications about your
                            property verification, certificate progress, and other important updates.
                        </p>
                        <Button text="Apply Now" />
                    </div>
                ) : filteredNotifications.length > 0 ? (

                    filteredNotifications.map((notif, index) => (
                        <div
                            key={notif.id}
                            className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#121315] border-l-2
      ${index < 3 ? "border-[#EFFC76]" : notif.highlight ? "border-[#EFFC76]" : "border-transparent"}
    `}
                        >

                            <div className="flex-shrink-0">
                                <Image
                                    src={notif.image}
                                    alt="Notification"
                                    width={50}
                                    height={50}
                                    className="rounded-md"
                                />
                            </div>


                            <div className="flex-1">
                                <h2 className="font-semibold text-4 leading-5 mb-2">
                                    {notif.title}
                                </h2>
                                <p className="font-normal text-[16px] leading-[20px] text-[#FFFFFF99] w-full max-w-[737px]">
                                    {notif.message}
                                </p>
                            </div>


                            <span className="font-normal text-xs sm:text-sm leading-[18px] text-[#FFFFFFCC] mt-2 sm:mt-0 sm:ml-4">
                                {notif.time}
                            </span>
                        </div>

                    ))
                ) : (

                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Image
                            src="/images/notify-empty.png"
                            alt="No Notifications"
                            width={150}
                            height={150}
                        />
                        <h2 className="mt-8 text-white text-[24px] leading-[28px] font-medium">
                            No {activeTab} notifications available
                        </h2>

                    </div>

                )}
            </div>


        </div>
    );
}