import AuthForm from "@/app/Layout/auth-layout/AuthForm";
import React from "react";
export default function Password() {
  return (
    <div>
      <AuthForm
        emptyemailmessage="Email address is required"
        wronginputmessage="Please enter a valid email address"
        showAlter={true}
        title="Forgot Password"
        subtitle="Recover access to your account in a few simple steps."
        submitText="Send Link"
        alterText="Remember your password?"
        linktext=" Login"
        link="/super-admin/auth/login"
        mode="forgot"
        onSubmit={() => {
          window.location.href = "/super-admin/auth/email-verification";
        }}
      />
    </div>
  );
}
