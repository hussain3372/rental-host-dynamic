// types.ts

// Property Details
export interface PropertyDetails {
  rent?: number;
  address?: string;
  bedrooms?: number;
  currency?: string;
  bathrooms?: number;
  maxGuests?: number;
  description?: string;
  propertyName?: string;
  propertyType?: string;
  ownership?: string;
  currentStep?: string;
  images?: string[];
}

// Property Type
export interface PropertyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  checklists: ChecklistItem[];
}

// Checklist Item
export interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
}

// Application Status Enum
export enum ApplicationStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  MORE_INFO_REQUESTED = "MORE_INFO_REQUESTED"
}

// Application Step Enum
export enum ApplicationStep {
  PROPERTY_DETAILS = "PROPERTY_DETAILS",
  COMPLIANCE_CHECKLIST = "COMPLIANCE_CHECKLIST",
  DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD",
  PAYMENTS = "PAYMENTS",
  SUBMISSION = "SUBMISSION",
}

// Document Type Enum
export enum DocumentType {
  OTHER = "OTHER",
  ID = "ID",
  PROPERTY_DEED = "PROPERTY_DEED",
  INSURANCE = "INSURANCE",
  LICENSE = "LICENSE",
  PERMIT = "PERMIT"
}

// Document
export interface Document {
  id: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
  url: string;
}

// Payment
export interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

// Host Summary
export interface HostSummary {
  id: number;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  email: string;
}

// Main Application Interface
export interface Application {
  id: string;
  status: string;
  submittedAt?: string | null;
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
  // Additional fields for API compatibility
  ownership?: string;
}

// Pagination Meta
export interface ApplicationsPaginationMeta {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Applications List Response
export interface ApplicationsListResponse {
  applications: Application[];
  pagination: ApplicationsPaginationMeta;
}

// API Wrapper Response (for nested API structure)
export interface ApiWrapperResponse {
  status: string;
  message: string;
  data: ApplicationsListResponse;
}

// Info Data for request more information
export interface InfoData {
  reviewNotes: string;
  message?: string;
  requestedInfo?: string[];
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Property Type API Response
export interface PropertyTypeApiResponse {
  message: string;
  data: PropertyType;
}

// Filter Parameters for getApplication
export interface ApplicationFilters {
  ownership?: string;
  status?: string;
  submittedAt?: string;
  currentStep?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ApplicationStats {
	dashboard: {
		applications: {
			total:number ,
			pending:number ,
			underReview:number ,
			approved:number ,
			rejected:number ,
			moreInfoRequested: number
		},
  }
}

interface Admin {
  id: string;
  name: string;
  email?: string;
}

export interface UsersResponse {
  data: {
    id: number;
    email: string;
    data?: Admin[];
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
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
  
  error?: ApiError;
  meta?: {
    status?: number;
    code?: string;
    success?: boolean;
    error?: ApiError;
  };
  message?: string;
}