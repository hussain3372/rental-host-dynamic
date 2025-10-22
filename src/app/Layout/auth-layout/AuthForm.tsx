  import React, { useState, useEffect } from "react";
  // import { Eye } from "lucide-react";
  import Image from "next/image";
  import Link from "next/link";
  import toast from "react-hot-toast";
  import InputField from "@/app/shared/InputSystem";

  interface FormData {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    otp?: string[];
  }

interface AuthFormProps<T = FormData> {
  mode: "login" | "signup" | "forgot" | "otp" | "reset-password";
  alterText?: string;
  linktext?: string;
  emptyOTP?: string;
  link?: string;
  emptyfirstNamemessage?: string;
  emptylastNamemessage?: string;
  emptyemailmessage?: string;
  emptypasswordmessage?: string;
  wronginputmessage?: string;
  forgotlink?: string;
  title: string;
  subtitle: string;
  submitText: string;
  showAlter: boolean;
  onSubmit: (formData: T) => void | Promise<void>; 
  loading?: boolean;
  error?: string;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  socialLoading?: boolean;
}


  const AuthForm: React.FC<AuthFormProps> = ({
    mode,
    alterText,
    linktext,
    emptyemailmessage="",
    emptylastNamemessage="",
    emptyfirstNamemessage="",
    emptyOTP="",
    emptypasswordmessage="",
    wronginputmessage="",
    link = "",
    forgotlink,
    title,
    subtitle,
    submitText,
    showAlter,
    onSubmit,
    loading = false,
    error,
    onGoogleLogin,
    onAppleLogin,
    socialLoading = false,
  }) => {
    const [formData, setFormData] = useState<FormData>({
      firstName:"",
      lastName:"",
      email: "",
      password: "",
      confirmPassword: "",
      otp: ["", "", "", "", "", ""],
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (field: keyof FormData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    };

    const handleOtpChange = (index: number, value: string) => {
      if (value.length <= 1 && formData.otp) {
        const newOtp = [...formData.otp];
        newOtp[index] = value;
        setFormData((prev) => ({ ...prev, otp: newOtp }));

        if (errors.otp) {
          setErrors((prev) => ({
            ...prev,
            otp: "",
          }));
        }

        if (value && index < 5) {
          const nextInput = document.getElementById(
            `otp-${index + 1}`
          ) as HTMLInputElement;
          nextInput?.focus();
        }
      }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (
        e.key === "Backspace" &&
        formData.otp &&
        !formData.otp[index] &&
        index > 0
      ) {
        const prevInput = document.getElementById(
          `otp-${index - 1}`
        ) as HTMLInputElement;
        prevInput?.focus();
      }
    };

    const validateForm = (): boolean => {
  const newErrors: { [key: string]: string } = {};

  if (mode === "otp") {
    const otpComplete = formData.otp?.every((digit) => digit.trim() !== "");
    if (!otpComplete) {
      newErrors.otp = emptyOTP || "Please enter all 6 digits";
    }
  }

  if ((mode === "login" || mode === "signup" || mode === "forgot") && !formData.email.trim()) {
    newErrors.email = emptyemailmessage;
  } else if ((mode === "login" || mode === "signup" || mode === "forgot") && !/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = wronginputmessage;
  }

  // ✅ Fixed: Check if firstName exists before calling trim()
  if (mode === "signup" && (!formData.firstName || !formData.firstName.trim())) {
    newErrors.firstName = emptyfirstNamemessage;
  }

  // ✅ Fixed: Check if lastName exists before calling trim()
  if (mode === "signup" && (!formData.lastName || !formData.lastName.trim())) {
    newErrors.lastName = emptylastNamemessage;
  }

  if ((mode === "login" || mode === "signup" || mode === "reset-password") && !formData.password.trim()) {
    newErrors.password = emptypasswordmessage;
  }

  // ✅ Fixed confirm password validation
  if (mode === "reset-password") {
    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

    const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (validateForm()) {
    onSubmit(formData); // ✅ Remove the optional chaining since onSubmit is now required
  }
};

    const config = {
      title: title,
      subtitle: subtitle,
      buttontext: submitText,
    };

    const currentConfig = config;
    const [timeLeft, setTimeLeft] = useState(120);
    const [showResend, setShowResend] = useState(false);

    useEffect(() => {
      if (timeLeft <= 0) {
        setShowResend(true);
        return;
      }
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
      const min = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const sec = (seconds % 60).toString().padStart(2, "0");
      return `${min}:${sec}`;
    };

    const handleResend = () => {
      toast.success("Your OTP has been resent");
      setTimeLeft(120);
      setShowResend(false);
    };

    const renderFields = () => {
      switch (mode) {
        case "login":
          return (
            <>
              <InputField
                type="email"
                label="Email"
                value={formData.email}
                onChange={(value:string) => handleInputChange("email", value)}
                placeholder="Enter email"
                error={errors.email}
              />
              <InputField
                type="password"
                label="Password"
                value={formData.password}
                onChange={(value:string) => handleInputChange("password", value)}
                placeholder="Enter password"
                error={errors.password}
                showPasswordToggle={true}
                isPasswordVisible={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <Link
                href={forgotlink || "/auth/forgot-password"}
                className="flex justify-end w-[103%] 2xl:w-full"
              >
                <p className="text-white opacity-80 text-[14px] leading-[18px] font-medium pt-[10px] pr-5">
                  Forgot Password?
                </p>
              </Link>
            </>
          );

        case "signup":
          return (
            <>
              <InputField
                type="text"
                label="First Name"
                value={formData.firstName || ""}
                onChange={(value:string) => handleInputChange("firstName", value)}
                placeholder="Enter First name"
                error={errors.firstName}
              />
              <InputField
                type="text"
                label="Last Name"
                value={formData.lastName || ""}
                onChange={(value:string) => handleInputChange("lastName", value)}
                placeholder="Enter Last name"
                error={errors.lastName}
              />
              
              <InputField
                type="email"
                label="Email"
                value={formData.email}
                onChange={(value:string) => handleInputChange("email", value)}
                placeholder="Enter email"
                error={errors.email}
              />
              <InputField
                type="password"
                label="Password"
                value={formData.password}
                onChange={(value:string) => handleInputChange("password", value)}
                placeholder="Enter password"
                error={errors.password}
                showPasswordToggle={true}
                isPasswordVisible={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </>
          );

        case "forgot":
          return (
            <InputField
              type="email"
              label="Email"
              value={formData.email}
              onChange={(value:string) => handleInputChange("email", value)}
              placeholder="Enter email"
              error={errors.email}
            />
          );

        case "otp":
          return (
            <div className="space-y-4">
              <div className="flex gap-3">
                {formData.otp?.map((digit, index) => (
                  <InputField
                    key={index}
                    type="otp"
                    label=""
                    value={digit}
                    onChange={(value:string) => handleOtpChange(index, value)}
                    error={errors.otp}
                    otpIndex={index}
                    onOtpKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="text-red-500 text-sm text-center">{errors.otp}</p>
              )}
              <p className="text-white pt-[40px] max-w-[602px] text-center font-bold text-[28px] leading-[32px]">
                {formatTime(timeLeft)}
              </p>

              <div className="font-semibold sm:max-w-[602px] text-[18px] leading-[22px] text-[#EFFC76] text-center pt-[40px] flex !justify-center">
                <button
                  onClick={handleResend}
                  disabled={!showResend}
                  className={`text-center underline ${
                    showResend ? "!cursor-pointer" : "cursor-not-allowed opacity-50"
                  }`}
                >
                  Resend Code
                </button>
              </div>
            </div>
          );

        case "reset-password":
          return (
            <>
              <InputField
                type="password"
                label="New password"
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                placeholder="Enter new password"
                error={errors.password}
                showPasswordToggle={true}
                isPasswordVisible={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <InputField
                type="password"
                label="Confirm new password"
                value={formData.confirmPassword || ""}
                onChange={(value) => handleInputChange("confirmPassword", value)}
                placeholder="Confirm new password"
                error={errors.confirmPassword}
                showPasswordToggle={true}
                isPasswordVisible={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </>
          );
      }
    };

    const shapesCount = 9;

    return (
      <div className="min-h-screen bg-[#121315] xl:gap-[80px] flex flex-col xl:flex-row">
        {/* Left Panel */}
        <div className="flex px-[20px] md:px-[80px] py-8 w-full xl:w-1/2">
          {/* Updated container classes for centering on medium screens */}
          <div className="w-full max-w-[640px] mx-auto md:mx-0 md:ml-0 space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image
                src="/images/auth-logo.png"
                alt="logo"
                width={100}
                height={58}
              />
            </div>

            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl text-white leading-[48px] font-bold text-[30px] sm:text-[40px]">
                {currentConfig.title}
              </h1>
              <p className="text-white opacity-60 font-regular text-[20px] leading-[24px] pt-[12px]">
                {currentConfig.subtitle}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form
            noValidate
              onSubmit={handleSubmit}
              className="space-y-4 flex xl:block flex-col justify-center"
            >
              {renderFields()}

              {/* Submit Button */}
              {mode === "signup" && (onGoogleLogin || onAppleLogin) && (
                <div className="space-y-4">
                  {/* Divider */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-[#121315] via-white to-[#121315]"></div>
                    <span className="text-white opacity-60 text-sm">or</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#121315] via-white to-[#121315]"></div>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex gap-[18px]">
                    {onGoogleLogin && (
                      <button
                        type="button"
                        onClick={onGoogleLogin}
                        disabled={socialLoading}
                        className="w-full bg-[#252628] cursor-pointer rounded-[8px] px-4 py-3 text-white hover:border-[#505050] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                      >
                        <Image
                          src="/images/google.png"
                          alt="Google"
                          width={20}
                          height={20}
                        />
                        <span className="font-medium text-[16px]">
                          {socialLoading ? "Please wait..." : "Google"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-center sm:justify-start">
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-[#EFFC76] yellow-btn mt-[40px] cursor-pointer text-[#101010] py-4 px-[40px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-inner font-semibold text-[18px] leading-[22px] 
                    ${mode === "login" ? "w-full" : "inline"}`}
                >
                  {loading ? "Please wait..." : currentConfig.buttontext}
                </button>
              </div>
              {showAlter && (
                <div
                  className={`py-[60px] ${
                    mode === "signup" || mode === "login" || mode === "forgot"
                      ? "block"
                      : "hidden"
                  }`}
                >
                  <p className="text-white/60 font-regular text-[16px] leading-[20px]">
                    {alterText}
                    <Link className="text-[#EFFC76] font-bold" href={link}>
                    {""}  {linktext}
                    </Link>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden xl:flex rounded-2xl relative z-[10] lg:w-1/2 items-end p-12">
          {/* Video background */}
          <video
            src="/videos/auth.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
          />

          {/* Gradient array background */}
          <div className="absolute inset-0 flex blur-[1px] z-[1]">
            {[...Array(shapesCount)].map((_, i) => (
              <div key={i} className="flex-1">
                <div
                  className="h-full w-full mix-blend-lighten"
                  style={{
                    opacity: 0.68,
                    background:
                      "linear-gradient(77deg, rgba(255,255,255,0.2) 11.03%, rgba(255,255,255,0.00) 92.77%)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-4"> 
            <div className="flex bg-[#202122] p-5 rounded-2xl items-center space-x-3">
              <Image
                src="/images/vector.png"
                alt="vector"
                width={48}
                height={48}
                className="z-[10]"
              />
              <div>
                <p className="text-white font-regular text-[12px] md:text-[20px] max-w-[473px] leading-[24px]">
                  Log in to list your property, manage your details, and earn your
                  verified badge for more trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default AuthForm;