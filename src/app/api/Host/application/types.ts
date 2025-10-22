// ----------------------------
// ENUMS
// ----------------------------

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
  ID_DOCUMENT = "ID_DOCUMENT",
  SAFETY_PERMIT = "SAFETY_PERMIT",
  INSURANCE_CERTIFICATE = "INSURANCE_CERTIFICATE",
  PROPERTY_DEED = "PROPERTY_DEED",
  OTHER = "OTHER",
}

// ----------------------------
// INTERFACES
// ----------------------------
export interface PropertyDetails {
  // Core property information
  propertyName: string;
  address: string;
  propertyType: string;
  maxGuests: number;
  description: string;
  ownership?: string;
  amenities: string[];

  // Additional properties from API response
  rent?: number;
  images?: string[];
  bedrooms?: number;
  currency?: string;
  bathrooms?: number;
}

export interface Host {
  id: number;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
}

export interface Reviewer {
  id: number;
  name: string;
  email: string;
}

export interface DocumentItem {
  id: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
}

export interface PaymentItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface Certification {
  id: string;
  certificateNumber: string;
  status: string;
  issuedAt: string;
}

export interface ApplicationData {
  id: string;
  hostId: number;
  status: ApplicationStatus | string; // Allow both enum and string for flexibility
  currentStep: ApplicationStep | string; // Allow both enum and string for flexibility
  propertyDetails?: PropertyDetails;
  submittedAt?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  host: Host;
  reviewer?: Reviewer | null;
  documents: DocumentItem[];
  payments: PaymentItem[];
  certification?: Certification | null;
  complianceChecklist : string[]

}

// ----------------------------
// API WRAPPERS
// ----------------------------
export interface PaginationInfo {
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
  status: string;
  message: string;
  applications: ApplicationData[];
  total: number;
  pagination?: PaginationInfo; // Add this

}

export interface ApplicationRequest {
  propertyDetails: {
    propertyName: string;
    address: string;
    ownership: string;
    propertyType: string;
  };
}

export interface ApplicationResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface UpdatePayload {
  step: string;
  data?: unknown;
}

export interface UpdateResponse {
  success: boolean;
  data: string;
  message: string;
}

export interface UploadPayload {
  files: File[]; // Array of File objects
}

export interface UploadedFile {
  url: string;
  key: string;
  name: string;
}

export interface FileUploadResponse {
  message: string;
  count: number;
  uploaded: UploadedFile[];
  success?: boolean;
}

export interface UploadDocumentPayload {
  files: File[];
  documentTye:
  | "ID_DOCUMENT"
  | "SAFETY_PERMIT"
  | "INSURANCE_CERTIFICATE"
  | "PROPERTY_DEED"

}

export interface UploadedDocument {
  url: string;
  path: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploaded: string[]
}


export interface ChecklistItem {
  id: number;
  checked: boolean;
  notes: string | null;
  checklistId: string;
  name: string;
  description: string | null;
    isRequired?: boolean;

}

export interface CheckListResponse {
  data: ChecklistItem[];
  success: boolean;
  message?: string;
}

export interface PaymentPayload {
  applicationId: string;
  amount: number;
  currency: string;
}

export interface PaymentResponse {
  data: string;
  success: boolean;
  message: string;
}
export interface SubmitResponse {
  data: string
  success: boolean
  message: string
}
export interface getApplicationByIdResponse {
  data: string[]
  success: boolean
  message: string
}
interface DocumentPayload {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  documentType:
  | 'ID_DOCUMENT'
  | 'SAFETY_PERMIT'
  | 'INSURANCE_CERTIFICATE'
  | 'PROPERTY_DEED'
  | string; // string fallback for any other types
}

export interface ApiPayload {
  documents: DocumentPayload[];
}