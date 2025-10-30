export interface UsersResponse {
  data: {
    id: number;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
    phone: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
      applications: number;
      certifications: number;
      supportTickets: number;
    };
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AddAdminResponse{
	message: string
	data: {
		id: number
		email: string
		firstName: string
		lastName: string
		role: string
		status: string
		createdAt: string
	}
}
export interface AddAdminPayload{
  name : string;
  email : string;
}

export interface GetUsersParams {
  search?: string;
  status?: string;
  maxListedProperties?: number;
  minListedProperties?: number;
  page?: number;
  limit?: number;
}


export interface UserDetail{
  id : number;
  email : string;
  name : string;
  firstName: string;
	lastName: string;
	companyName?: string;
	phone?: string;
	role: string;
	status: string;
	emailVerified: boolean;
	isEmail: boolean;
	isNotification: boolean;
	mfaEnabled: boolean;
	lastLoginAt: string;
	createdAt: string;
	updatedAt: string;
	statistics: {
		listedProperties: number;
		certifiedProperties: number;
		expiredCertificates: number;
		rejectedProperties: number
	}
}

export interface PropertyResponse {
  status: string;
  message: string;
  data: {
    id: string;
    status: string;
    currentStep: string;
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
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    createdAt: string;
    updatedAt: string;
    certification: string | null;
    images: {
      id: string;
      name: string;
      url: string;
      mimeType: string | null;
      uploadedAt: string;
    }[];
    documents: string;
    _count: {
      documents: number;
      images: number;
      complianceItems: number;
    };
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPrevPage : boolean
    hasNextPage : boolean
    prevPage : number
    nextPage : number
  };
}

export interface GetUserPropertiesParams {
  search?: string;
  status?: string;
  submittedFrom?: string;
  submittedTo?: string;
  ownership?: string;
  page?: number;
  limit?: number;
}

export interface BillingHistoryResponse {
  status: string;
  message: string;
  data: {
    id: string;
    amount: string;
    currency: string;
    status: string;
    paymentMethod: string;
    gatewayTransactionId: string;
    gatewayResponse: Record<string, string >;
    refundedAmount: string | null;
    refundedAt: string | null;
    createdAt: string;
    updatedAt: string;
    host: {
      id: number;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
    };
    application: {
      id: string;
      status: string;
      propertyDetails: {
        rent?: number;
        images: string[];
        address: string;
        bedrooms?: number;
        currency?: string;
        bathrooms?: number;
        maxGuests?: number;
        ownership: string;
        description: string;
        propertyName: string;
        propertyType: string;
      };
    };
  }[];
  summary: {
    totalAmount: number;
    completedCount: number;
    pendingCount: number;
    failedCount: number;
    refundedCount: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPrevPage : boolean
    hasNextPage : boolean
    prevPage : number
    nextPage : number
  };
}

export interface GetUserBillingParams {
  search?: string;
  status?: string;
  endDateFrom?: string;
  endDateTo?: string;
  page?: number;
  limit?: number;
}
export interface PropertyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  checklists: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

export interface PropertyTypeApiResponse {
  message: string;
  data: PropertyType;
}

export interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
}

export interface Application {
  id: string;
  status: string;
  submittedAt?: string|null;
  currentStep?: string;
  propertyDetails?: {
    propertyName?: string;
    address?: string;
    ownership?: string;
    propertyType?: string;
    images?: string[];
    description?: string;
  };
  checklist?: ChecklistItem[];
  documents?: Document[];
  complianceChecklist: string[];
}
export interface Document {
  id: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
  url : string;
}

export interface Certification {
  id: string;
  applicationId: string;
  hostId: number;
  certificateNumber: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED"|"RENEW";
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  revokedBy: number | null;
  revokeReason: string | null;
  badgeUrl: string;
  qrCodeUrl: string;
  qrCodeData: string;
  verificationUrl: string;
  createdAt: string;
  updatedAt: string;
  application: Application;
  // host: Host;
  revoker: string | null;
}

export interface AdminData {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  isEmail: boolean;
  isNotification: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    verifiedProperties: number;
    pendingApplications: number;
    rejectedApplications: number;
    approvalRate: string;
    totalReviewed: number;
  };
}

export interface GetAdminReviewedApplicationsParams {
  search?: string;
  status?: string;
  reviewedFrom?: string; // Format: YYYY-MM-DD
  reviewedTo?: string;   // Format: YYYY-MM-DD
  page?: number;
  limit?: number;
}


export interface ApplicationsResponse{
    id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  data : string
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  isEmail: boolean;
  isNotification: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    verifiedProperties: number;
    pendingApplications: number;
    rejectedApplications: number;
    approvalRate: string;
    totalReviewed: number;
  };
  pagination : {
    limit : number
    page : number
    totalPages : number
    total : number
    hasPrevPage:boolean
    hasNextPage:boolean
    prevPage: number
    nextPage : number
  }
}

// In your types file
export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  phone?: string | null;
  companyName?: string | null;
}

export interface UpdateUserResponse {
  status: string;
  message: string;
  data: {
    id: number;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
    phone: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    updatedAt: string;
  };
}

// Same for admin
export interface UpdateAdminPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  phone?: string | null;
  companyName?: string | null;
}
export interface UpdateAdminResponse extends UpdateUserResponse {
    status: string;
  message: string;
  data: {
    id: number;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
    phone: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    updatedAt: string;
  };
}