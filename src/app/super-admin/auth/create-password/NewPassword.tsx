// import React from 'react'
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
// import toast from 'react-hot-toast'
export default function NewPassword() {
  const handleSubmit = ()=>{
    window.location.href = "/super-admin/dashboard"
  }
  return (
    <div>
      <AuthForm
        emptypasswordmessage="Password is required"
        title="Create New Password"
        subtitle="Set a strong new password to secure your account and continue."
        submitText="Reset Password"
        showAlter={false}
        mode="reset-password"
        onSubmit={handleSubmit}
        
      />
    </div>
  );
}
