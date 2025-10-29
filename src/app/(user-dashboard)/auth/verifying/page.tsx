'use client'

import React from "react";

export default function WaitingPage() {
  const openGmail = () => {
    // Open Gmail inbox in a new tab
    window.open("https://mail.google.com/", "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0C0B] text-white px-4 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold mb-3">
        Waiting for Verification
      </h1>
      <p className="text-[#FFFFFF99] text-base md:text-lg max-w-md">
        Your account has been created successfully. Please check your email and
        verify your account before proceeding.
      </p>
      <button
        type="button"
        onClick={openGmail}
        className={`bg-[#EFFC76] yellow-btn mt-[40px] cursor-pointer text-[#101010] py-4 px-[40px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-inner font-semibold text-[18px] leading-[22px]`}
      >
        Go to Inbox
      </button>
    </div>
  );
}
