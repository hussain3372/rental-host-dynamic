"use client";
// import React from "react";
import AuthForm from "../../../Layout/auth-layout/AuthForm";

export default function Login() {
  const handleSubmit = ()=>{
    window.location.href = "/super-admin/dashboard"
  }
  return (
    <div>
      <AuthForm
        emptyemailmessage="Email address is required"
        wronginputmessage="Please enter a valid email address"
        emptypasswordmessage="Password is required"
        title="Welcome Back!"
        subtitle="Sign in to explore your personalized dashboard."
        submitText="Login"
        forgotlink="/super-admin/auth/forgot-password"
        mode="login"
        showAlter={false}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
