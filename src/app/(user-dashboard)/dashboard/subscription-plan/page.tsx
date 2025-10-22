"use client";
import React from "react";
import NotificationPreferences from "./NotificationPreferences";
import BillingHistoryTable from "./BillingHistoryTable";
export default function page() {
  return (
    <>
      <div className="space-y-2 mb-[40px]">
        <h1 className="text-[20px] leading-[24px] font-semibold text-white">
          Settings & Preferences
        </h1>
        <p className="text-4 leading-5 text-[#FFFFFF99] font-normal max-w-[573px] w-full">
          Manage your personal details, security, notifications, and billing all
          in one place. Customize your experience and keep your account up to
          date.
        </p>
      </div>
      {/* <SubscriptionPlan /> */}
      <BillingHistoryTable />
      <NotificationPreferences />
    </>
  );
}
