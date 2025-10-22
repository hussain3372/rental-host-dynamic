"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { LogoutModal } from "./LogoutModal";
import { useRouter } from "next/navigation";
import EditProfileDrawer from "./EditProfileDrawer";
export default function ProfilePage() {
    const [name, setName] = useState("John Doe");
    const [email, setEmail] = useState("john@gmail.com");
    const [isEditable] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [profileImage, setProfileImage] = useState("/images/profile-pic.png");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const router = useRouter();

    const handleEditClick = () => setIsDrawerOpen(true);
    const handleSaveChanges = (newName: string, newEmail: string) => {
        setName(newName);
        setEmail(newEmail);
        setIsDrawerOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/auth/login");
    };

    const handleChangePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    return (
        <div className=" text-white pb-[180px] ">
             <div className="flex items-center justify-between mb-6">
                <h1 className="text-[20px] leading-[24px] font-semibold">Your Profile</h1>

            </div>

            <p className="text-4 leading-5 text-[#FFFFFF99] font-normal mb-[40px]">
                Manage your personal information and keep your account details up to date.
            </p>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden relative">
                        <Image src={profileImage} alt="Profile" fill className="object-cover" />
                    </div>
                    <div>
                        <h2 className="text-[20px] md:text-[24px] font-medium leading-[28px] mb-1">{name}</h2>
                        <p className="text-[#FFFFFF66] text-[16px] md:text-[18px] leading-[22px] font-normal">
                            {email}
                        </p>
                    </div>
                </div>

                <button
                    className="w-full cursor-pointer md:w-auto text-[16px] leading-[20px] font-semibold flex justify-center items-center px-5 py-3 rounded-[8px] text-[#EFFC76] border border-[#EFFC76] hover:bg-[#EFFC76] hover:text-black transition"
                    onClick={handleChangePhotoClick}
                >
                    Change Photo
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Content Grid */}
            <div className="flex flex-col lg:flex-row gap-5 mb-5">
                {/* Personal Info */}
                <div className="flex-1 relative bg-[#1b1b1d] p-5 rounded-xl">
                    <button
                        type="button"
                        className="absolute top-4 right-4 text-[#EFFC76] underline transition text-[16px] leading-[20px] font-normal cursor-pointer"
                        onClick={handleEditClick}
                    >
                        Edit
                    </button>

                    <h3 className="text-[18px] leading-[22px] font-medium mb-2">Personal Information</h3>
                    <p className="mb-4 text-sm text-white/70">
                        Keep your personal information accurate and up to date.
                    </p>

                   <form className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <div>
    <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">Name</label>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      readOnly={!isEditable}
      className={`w-full h-[52px] rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] outline-none px-4 text-white ${!isEditable ? "opacity-100" : ""}`}
    />
  </div>

  <div>
    <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">Email</label>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      readOnly={!isEditable}
      className={`w-full h-[52px] rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] px-4 outline-none text-white ${!isEditable ? "opacity-100" : ""}`}
    />
  </div>
</form>

                </div>


                {/* Card Section
                <div className="relative w-full lg:max-w-[435px] h-[282px] rounded-b-[24px] sm:rounded-[12px] border border-[rgba(0,0,0,0.04)] overflow-hidden">
                    <button
                        type="button"
                        className="absolute top-4 right-4 text-[#EFFC76] underline z-10 text-[16px] leading-[20px] cursor-pointer"
                        onClick={() => setIsCardDrawerOpen(true)}
                    >
                        Edit
                    </button>

                    <Image
                        src="/images/card-bg.png"
                        alt="Card Background"
                        fill
                        className="object-cover rounded-[12px]"
                    />

                    <div className="absolute inset-0 p-5 text-white">
                        <div className="flex flex-col items-start">
                            <h3 className="text-[20px] md:text-[24px] font-medium leading-[28px] mb-6">
                                John Doe
                            </h3>
                            <Image
                                src="/images/card-chip.png"
                                alt="Card Icon"
                                width={55}
                                height={40}
                                className="object-contain"
                            />
                        </div>

                        <div className="absolute bottom-5 left-4 flex flex-col items-start">
                            <p className="text-[14px] leading-[18px] font-normal text-[#FFFFFFCC] mb-2">
                                Card Number
                            </p>
                            <p className="text-white text-[16px] md:text-[18px] leading-[22px] font-medium">
                                2341-****-0987
                            </p>
                        </div>

                        <div className="absolute bottom-5 right-4 flex flex-col items-end">
                            <p className="text-[14px] leading-[18px] font-normal text-[#FFFFFFCC] mb-2">CVC/CVV</p>
                            <p className="text-white text-[16px] md:text-[18px] leading-[22px] font-medium">
                                *************
                            </p>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Logout */}
            <div
                className="relative flex flex-col bg-[#1b1b1d] p-5 rounded-xl cursor-pointer hover:bg-[#2a2a2c] transition"
                onClick={() => setIsLogoutModalOpen(true)}
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
                        <span className="text-[18px] leading-[22px] font-medium mb-2">Logout</span>
                        <p className="text-[#FFFFFF99] text-[14px] md:text-[16px] leading-5 font-normal">
                            End your current session securely. Logging out ensures your information stays private, especially on shared devices.
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

            {/* Drawer */}

            <div
                className={`fixed inset-0 bg-[#121315CC] z-[1100] transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsDrawerOpen(false)}
            >
                <div
                    className={`w-full sm:w-[480px] md:w-[608px] p-7 h-full bg-[#0A0C0B] overflow-auto border border-[#FFFFFF1F] rounded-[12px] shadow-[0_4px_12px_0_rgba(0,0,0,0.12)] transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
                        } ml-auto`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <EditProfileDrawer
                        initialName={name}
                        initialEmail={email}
                        onSave={(newName, newEmail) => handleSaveChanges(newName, newEmail)}
                        onClose={() => setIsDrawerOpen(false)}
                    />
                </div>
            </div>
           
        </div>
    );
}
