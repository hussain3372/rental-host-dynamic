import React from "react";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
export default function Email() {
  const handleSubmit = ()=>{
    window.location.href = "/super-admin/dashboard"
  }
  return (
    <div>
      <AuthForm
        emptyOTP="Please enter your OTP"
        title="Verify Your Email"
        subtitle="We’ve sent a verification code to your email address. Please enter it below to continue."
        submitText="Verify"
        showAlter={false}
        mode="otp"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
