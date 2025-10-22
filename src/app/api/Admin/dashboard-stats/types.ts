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