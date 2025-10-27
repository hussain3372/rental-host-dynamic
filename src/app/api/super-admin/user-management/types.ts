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
    gatewayResponse: Record<string, string>;
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