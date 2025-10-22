export interface SettingData {
  data: {
    isEmailStatus?: boolean;
    isNotificationStatus?: boolean;
  };
}

export interface TwoFactorAuth {
  mfaEnabled: boolean;
}
export interface ChangePasswordResponse {
  status: string;
  message: string;
}
// types/payment.ts
export interface PaymentResponse {
  payments: {
    id: string;
    applicationId: string;
    hostId: number;
    amount: string;
    currency: string;
    status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED" | "CANCELLED";
    paymentMethod: string;
    gatewayTransactionId: string;
    gatewayResponse: {
      mock?: boolean;
      // [key: string]: any;
    };
    refundedAmount: string | null;
    refundedAt: string | null;
    createdAt: string;
    updatedAt: string;
    application: {
      id: string;
      status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
      propertyDetails: {
        rent: number;
        images: string[];
        address: string;
        bedrooms: number;
        currency: string;
        bathrooms: number;
        maxGuests: number;
        ownership: string;
        description: string;
        propertyName: string;
        propertyType: string;
      };
    };
    host: {
      id: number;
      name: string;
      email: string;
    };
  }[];
  total: number;
}