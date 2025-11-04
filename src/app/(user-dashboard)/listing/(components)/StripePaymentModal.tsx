"use client";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Image from "next/image";
import toast from "react-hot-toast";
import { application } from "@/app/api/Host/application";
import type { PaymentResponseReal } from "@/app/api/Host/application/types";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number; // Amount in cents
  currency?: string;
}

const CheckoutForm: React.FC<{
  onSuccess: () => void;
  onClose: () => void;
  amount: number;
}> = ({ onSuccess, onClose, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // 1️⃣ Create payment intent on your backend
      const response = await application.createPayment({
        amount: 99, // Use the amount passed to the component
        currency: "USD",
        description: "Payment for property listing application",
        applicationId: localStorage.getItem("applicationData") 
          ? JSON.parse(localStorage.getItem("applicationData")!).id 
          : "",
      });

      // Cast to PaymentResponseReal since we know the API returns this shape
      const backendResponse = response as unknown as PaymentResponseReal;
      const { clientSecret } = backendResponse;

      // 2️⃣ Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });

      if (stripeError) {
        setErrorMessage(stripeError.message || "Payment failed");
        toast.error(stripeError.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#ffffff",
        "::placeholder": {
          color: "rgba(255, 255, 255, 0.4)",
        },
        backgroundColor: "transparent",
      },
      invalid: {
        color: "#ef4444",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-medium leading-[18px] text-white text-sm mb-3">
          Card Details
        </label>
        <div className="w-full p-4 bg-gradient-to-b from-[#202020] to-[#101010] border border-[#4a4a4a] rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 text-[16px] bg-gradient-to-b from-[#202020] to-[#101010] border border-[#4a4a4a] text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-3 text-[16px] bg-gradient-to-b from-[#EFFC76] to-[#d4e05c] text-black font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

export default function StripePaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  currency = "USD",
}: StripePaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#4a4a4a] rounded-xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <Image src="/images/close.svg" alt="close" width={24} height={24} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-[#4a4a4a]">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src="/images/stripe-logo.svg"
              alt="Stripe"
              width={60}
              height={24}
            />
          </div>
          <h3 className="text-xl font-semibold text-white">Complete Payment</h3>
          <p className="text-sm text-white/60 mt-1">
            Secure payment powered by Stripe
          </p>
        </div>

        {/* Payment amount */}
        <div className="px-6 py-4 bg-[#1c1f14] border-b border-[#4a4a4a]">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total Amount</span>
            <span className="text-2xl font-bold text-[#EFFC76]">
              ${(amount / 100).toFixed(2)} {currency}
            </span>
          </div>
        </div>

        {/* Payment form */}
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              onSuccess={onSuccess}
              onClose={onClose}
              amount={amount}
            />
          </Elements>
        </div>

        {/* Security notice */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Image src="/images/lock.png" alt="secure" width={12} height={12} />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
