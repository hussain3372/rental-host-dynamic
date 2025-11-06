  "use client";
  import React, { useState, useRef, useEffect } from "react";
  import Image from "next/image";
  import { LogoutModal } from "./LogoutModal";
  import { useRouter } from "next/navigation";
  import EditProfileDrawer from "./EditProfileDrawer";
  import { profile } from "@/app/api/Admin/profile";
import toast from "react-hot-toast";



  export default function ProfilePage() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [uploading, setUploading] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();

    // Fetch Profile Data on Mount
    useEffect(() => {
  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await profile.fetchProfileData();
      
      if (res.data) {
        const { firstName, lastName, email: userEmail, profilePicture } = res.data.data;
        
        setName(
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || "User"
        );
        setEmail(userEmail || "");
        setProfileImage(profilePicture || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile data";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

    // Handle Save from Drawer
   const handleSaveChanges = async (newName: string, newEmail: string): Promise<void> => {
  try {
    const [firstName, ...rest] = newName.split(" ");
    const lastName = rest.join(" ") || "";

    const payload = { firstName, lastName, email: newEmail };
    await profile.updateProfileData(payload);

    localStorage.setItem("adminFirstname", firstName);
    localStorage.setItem("adminLastname", lastName);
    localStorage.setItem("adminEmail", newEmail);

    setName(newName);
    setEmail(newEmail);
    setIsDrawerOpen(false);
    
    toast.success("Profile updated successfully!");
    
    // Notify navbar of profile update
    window.dispatchEvent(new Event('profileUpdated'));
  } catch (error) {
    console.error("Error updating profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
    toast.error(errorMessage);
  }
};

    // Handle Logout
    const handleLogout = async () => {
      

      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Function to delete a specific cookie
      const deleteCookie = (name: string) => {
        // Standard deletion
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Try with SameSite
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;`;
        // Try with domain
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
      };

      // Delete specific application cookies
      deleteCookie('adminAccessToken');
      deleteCookie('refreshToken');
      deleteCookie('next-auth.session-token');
      deleteCookie('next-auth.csrf-token');
      deleteCookie('next-auth.callback-url');

      // Create a logout URL that clears Google session and redirects back
      
      const returnUrl = `${window.location.origin}/admin/auth/login`;
      
      // Open Google logout in a hidden iframe to clear Google cookies
      

      // Wait a moment for Google logout, then redirect
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 1000);
      router.push('/admin/auth/login')
    };

    // Handle Change Photo
    const handleChangePhotoClick = (): void => {
      fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
  const file = e.target.files?.[0];
  if (!file) return;

  let previewUrl: string | null = null;

  try {
    setUploading(true);
    
    // Show preview instantly
    previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);
    
    // Upload to server
    const res = await profile.updateProfileImage(file);

    // Check for API errors first
    if (res.errors && res.errors.length > 0) {
      const errorMessage = res.errors[0] || "Failed to upload profile picture";
      throw new Error(errorMessage);
    }

    if (res?.data?.data?.profilePicture) {
      const newProfileImage = res.data.data.profilePicture;
      setProfileImage(newProfileImage);
      localStorage.setItem('adminProfile', newProfileImage);
      
      toast.success("Profile picture updated successfully!");
      
      // Notify navbar of profile image update
      window.dispatchEvent(new Event('profileUpdated'));
    } else {
      throw new Error("Failed to upload image - no profile picture in response");
    }
  } catch (err: unknown) {
    console.error("Error uploading profile image:", err);
    
    // Extract exact error message
    let errorMessage = "Failed to upload profile picture";
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'object' && err !== null) {
      // Try to extract from API error response
      const apiError = err as { response?: { data?: { error?: { message?: string } } } };
      errorMessage = apiError.response?.data?.error?.message || errorMessage;
    }
    
    toast.error(errorMessage);
    
    // Revert to previous image on error
    const previousProfile = localStorage.getItem('adminProfile');
    setProfileImage(previousProfile);
  } finally {
    setUploading(false);
    
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[400px] text-white">
          Loading profile...
        </div>
      );
    }

    return (
      <div className="text-white pb-[180px]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[20px] leading-[24px] font-semibold">
            Your Profile
          </h1>
        </div>

        <p className="text-4 leading-5 text-[#FFFFFF99] font-normal mb-[40px]">
          Manage your personal information and keep your account details up to
          date.
        </p>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
          {/* Profile Image Section */}
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden relative flex items-center justify-center bg-[#1b1b1d]">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[#B0B0B0]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0"
                  />
                </svg>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-sm">Uploading...</div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-[20px] md:text-[24px] font-medium leading-[28px] mb-1">
                {name}
              </h2>
              <p className="text-[#FFFFFF66] text-[16px] md:text-[18px] leading-[22px] font-normal">
                {email}
              </p>
            </div>
          </div>

          <button
            className="w-full md:w-auto cursor-pointer text-[16px] leading-[20px] font-semibold flex justify-center items-center px-5 py-3 rounded-[8px] text-[#EFFC76] border border-[#EFFC76] hover:bg-[#EFFC76] hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleChangePhotoClick}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Change Photo"}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {/* Personal Info Section */}
        <div className="flex flex-col lg:flex-row gap-5 mb-5">
          <div className="flex-1 relative bg-[#1b1b1d] p-5 rounded-xl">
            <button
              type="button"
              className="absolute top-4 right-4 text-[#EFFC76] underline transition text-[16px] leading-[20px] font-normal cursor-pointer hover:text-yellow-200"
              onClick={() => setIsDrawerOpen(true)}
            >
              Edit
            </button>

            <h3 className="text-[18px] leading-[22px] font-medium mb-2">
              Personal Information
            </h3>
            <p className="mb-4 text-sm text-white/70">
              Keep your personal information accurate and up to date.
            </p>

            <form className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  readOnly
                  className="w-full h-[52px] rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] outline-none px-4 text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full h-[52px] rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] px-4 outline-none text-white cursor-not-allowed"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Logout Section */}
        <div
          className="relative flex flex-col bg-[#1b1b1d] p-5 rounded-xl cursor-pointer hover:bg-[#2a2a2c] transition"
          onClick={() => setIsLogoutModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsLogoutModalOpen(true);
            }
          }}
        >
          <div className="absolute top-5 right-5 sm:hidden">
            <Image
              src="/images/arrow-right.png"
              alt="Arrow Right"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[18px] leading-[22px] font-medium mb-2">
                Logout
              </span>
              <p className="text-[#FFFFFF99] text-[14px] md:text-[16px] leading-5 font-normal">
                End your current session securely. Logging out ensures your
                information stays private, especially on shared devices.
              </p>
            </div>

            <div className="hidden sm:block">
              <Image
                src="/images/arrow-right.png"
                alt="Arrow Right"
                width={24}
                height={24}
                className="object-contain shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Logout Modal */}
        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
        />

        {/* Edit Profile Drawer */}
        <div
          className={`fixed inset-0 bg-[#121315CC] z-[1100] transition-opacity duration-300 ${
            isDrawerOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsDrawerOpen(false)}
          role="presentation"
        >
          <div
            className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-7 h-full bg-[#0A0C0B] overflow-auto border border-[#FFFFFF1F] rounded-[12px] shadow-[0_4px_12px_0_rgba(0,0,0,0.12)] transform transition-transform duration-300 ease-in-out ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            } ml-auto`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Edit Profile"
          >
            <EditProfileDrawer
              initialName={name}
              initialEmail={email}
              onSave={(newName: string, newEmail: string) => handleSaveChanges(newName, newEmail)}
              onClose={() => setIsDrawerOpen(false)}
            />
          </div>
        </div>
      </div>
    );
  }