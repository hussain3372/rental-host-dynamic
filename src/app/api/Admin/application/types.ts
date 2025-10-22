// types.ts

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
// Add PropertyType interface
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
export interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
}

export enum ApplicationStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  MORE_INFO_REQUESTED = "MORE_INFO_REQUESTED",
}

export enum ApplicationStep {
  PROPERTY_DETAILS = "PROPERTY_DETAILS",
  COMPLIANCE_CHECKLIST = "COMPLIANCE_CHECKLIST",
  DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD",
  PAYMENTS = "PAYMENTS",
  SUBMISSION = "SUBMISSION",
}

export enum DocumentType {
  OTHER = "OTHER",
  ID = "ID",
  PROPERTY_DEED = "PROPERTY_DEED",
  INSURANCE = "INSURANCE",
  LICENSE = "LICENSE",
  PERMIT = "PERMIT",
}

export interface Document {
  id: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
  url: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface HostSummary {
  id: number;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  email: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  status: string;
  issuedAt: string;
}

// In your types file, update the Application interface:
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
  certification?: Certificate;
  checklist?: ChecklistItem[];
  documents?: Document[];
  complianceChecklist: string[];
}

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

export interface ApplicationsListResponse {
  applications: Application[];
  pagination: ApplicationsPaginationMeta;
}

export interface ApiWrapperResponse {
  status: string;
  message: string;
  data: ApplicationsListResponse;
}

export interface InfoData {
  reviewNotes: string;
}
export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}

export interface ApiResponse {
  success: boolean;
  error?: ApiError;
}
