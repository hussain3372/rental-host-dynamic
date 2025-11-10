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
  meta : {
    total : number
    totalPages:number
    hasPrevPage:boolean
    hasNextPage : boolean
    limit : number
    page : number
    
  }
}
export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}


interface GatewayRefundResponse {
  id: string;
  amount: number;
  charge: string;
  object: string;
  reason: string;
  status: string;
  created: number;
  currency: string;
  metadata: Record<string, string>;
  payment_intent: string;
  receipt_number: string | null;
  transfer_reversal: string | null;
  balance_transaction: string;
  destination_details: {
    card: {
      type: string;
      reference_type: string;
      reference_status: string;
    };
    type: string;
  };
  source_transfer_reversal: string | null;
}

export interface RefundResponse {
  id: string;
  applicationId: string;
  hostId: number;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  gatewayTransactionId: string;
  gatewayResponse: GatewayRefundResponse;
  refundedAmount: string;
  refundedAt: string;
  createdAt: string;
  updatedAt: string;
}
export interface Transaction {
    id: string;
    hostName: string;
    transactionId: string;
    planName: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    currency: string;
    application?: {
      id: string;
      status: string;
      propertyDetails: {
        propertyName: string;
        address: string;
      };
    };
    host?: {
      name: string;
      email: string;
    };
    gatewayResponse?: {
      id?: string;
      customer?: string;
      receipt_email?: string;
    };
    refundedAmount?: string | null;
    refundedAt?: string | null;
  }

  export interface ErrorRes {
     success: boolean;
        data: null;
        message: string;
        errors: string[];
        meta: {
          status: number;
          code: string;
          success: boolean;
          error: unknown[];
          timestamp: string;
        };
  }