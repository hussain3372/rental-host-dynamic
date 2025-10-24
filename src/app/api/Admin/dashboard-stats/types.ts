export interface DashboardResponse {
  applications: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    moreInfoRequested: number;
  };
  certifications: {
    total: number;
    active: number;
    expired: number;
    revoked: number;
    expiringSoon: number;
  };
  users: {
    totalHosts: number;
    totalAdmins: number;
    totalSuperAdmins: number;
    activeHosts: number;
  };
  recentActivity: {
    applications: ApplicationActivity[];
    certifications: CertificationActivity[];
  };
}

export interface ApplicationActivity {
  id: string;
  hostName: string;
  status: string;
  submittedAt: string;
  currentStep: string;
}

export interface CertificationActivity {
  // This interface is empty since the certifications array is empty in your example
  // You would need to define the properties based on your actual certification data structure
  id?: string;
  // Add other certification properties as needed
}
export interface GraphInterface {
  id: string;
  hostName: string;
  hostEmail: string;
  hostCompany: string;
  propertyName: string;
  propertyType: string;
  propertyAddress: string;
  propertyCity: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'; // Based on your data
  currentStep: 'PROPERTY_DETAILS' | 'DOCUMENT_UPLOAD' | 'SUBMISSION'; // Based on your data
  submittedAt: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  reviewedBy?: string; // Optional based on your data
  reviewedAt?: string; // Optional ISO date string
  documentsCount: number;
  paymentStatus: 'PENDING' | 'PAID'; // Based on your data
  priority: 'low' | 'medium' | 'high'; // Based on your data
  daysWaiting: number;
}

export interface GraphResponse {
  applications: GraphInterface[];
  total: number;
  period: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    startDate: string; // ISO date string
    endDate: string; // ISO date string
  };
}