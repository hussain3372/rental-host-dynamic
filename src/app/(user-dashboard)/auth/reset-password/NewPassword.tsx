"use client"
import React, { useState, useEffect } from 'react'
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
import toast from 'react-hot-toast';
import { auth } from '@/app/api/auth';

interface PasswordFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export default function NewPassword() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Get token from URL parameters using window.location
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      toast.error("Invalid or missing reset token");
    }
  }, []);

  const handlePassword = async (formData: PasswordFormData) => {
    try {
      setLoading(true);
      
      if (!token) {
        toast.error("Invalid reset token");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const response = await auth.createPassword({
        token: token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword || ''
      });
      
      if (response.success) {
        toast.success(response.message || "Password reset successful!");
        window.location.href = "/dashboard";
      } else {
        toast.error(response.message || "Password reset failed");
      }

    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthForm
        emptypasswordmessage="Password is required"
        title="Create New Password"
        subtitle="Set a strong new password to secure your account and continue."
        submitText="Reset Password"
        showAlter={true}
        loading={loading}
        mode="reset-password"
        onSubmit={handlePassword}
      />
    </div>
  );
}