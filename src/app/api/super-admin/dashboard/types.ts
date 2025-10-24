export interface RevenueResponse {
  status: string;
  message: string;
  data: {
    totalRevenue: {
      amount: number;
      currency: string;
      transactionCount: number;
    };
    currentMonth: {
      amount: number;
      transactionCount: number;
      averageTransactionValue: number;
      period: {
        start: string;
        end: string;
      };
    };
    lastMonth: {
      amount: number;
      transactionCount: number;
      averageTransactionValue: number;
      period: {
        start: string;
        end: string;
      };
    };
    comparison: {
      percentageChange: string;
      absoluteChange: number;
      transactionCountChange: number;
    };
  };
}

export interface DashboardStatsResponse {
  status: string;
  message: string;
  data: {
    totalHosts: {
      count: number;
      thisMonth: number;
      lastMonth: number;
      percentageChange: string;
    };
    totalAdmins: {
      count: number;
      thisMonth: number;
      lastMonth: number;
      percentageChange: string;
    };
    activeCertificates: {
      count: number;
      thisMonth: number;
      lastMonth: number;
      percentageChange: string;
    };
    expiredCertificates: {
      count: number;
      thisMonth: number;
      lastMonth: number;
      percentageChange: string;
    };
  };
  comparisonPeriod: {
    current: {
      start: string;
      end: string;
    };
    previous: {
      start: string;
      end: string;
    };
  };
}

export interface RevenueInsightsResponse {
  status: string;
  message: string;
  period: string;
  year: number;
  data: Array<{
    date: string;
    label: string;
    revenue: number;
    transactions: number;
    averageTransactionValue: number;
  }>;
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageDailyRevenue: number;
  };
}

export interface PropertyInsightsResponse {
  status: string;
  message: string;
  period: string;
  year: number;
  data: Array<{
    date: string;
    label: string;
    propertiesListed: number;
    certificatesGenerated: number;
    approved: number;
    submitted: number;
    rejected: number;
    conversionRate: number;
  }>;
  summary: {
    totalPropertiesListed: number;
    totalCertificatesGenerated: number;
    totalApproved: number;
    totalSubmitted: number;
    totalRejected: number;
    averageDailyListings: number;
    overallConversionRate: number;
  };
}