export interface PaymentStatsResponse {
  totalRevenue: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
  monthlyRevenue: number;
  pendingPayments: number;
}
