export interface CertificateResponse {
  id: string;
  propertyTypeId: string;
  name: string;
  description: string;
  validityMonths: number;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  deletedAt: string | null;
}

export interface CertificateDetailResponse {
  template: CertificateTemplate;  
  stats: CertificateStats;
  pagination: Pagination;
  certificates: CertificateItem[];
}

// Template info
export interface CertificateTemplate {
  id: string;
  propertyTypeId: string;
  name: string;
  description: string;
  validityMonths: number;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  deletedAt: string | null;
  propertyType: PropertyType;
  createdByUser: CreatedByUser;
}

export interface PropertyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedByUser {
  id: number;
  name: string;
  email: string;
}

export interface CertificateStats {
  totalCertificates: number;
  totalIssued: number;
  totalRevoked: number;
  totalExpired: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CertificateItem {
  id: string;
  certificateNumber: string;
  host: Host;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  issuedAt: string;
  expiresAt: string;
  validity: string;
}

export interface Host {
  id: number;
  name: string;
  email: string;
}




// types.ts
export interface PropertyDetails {
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
}

export interface Application {
  id: string;
  hostId: number;
  propertyDetails: PropertyDetails;
}

export interface Host {
  id: number;
  name: string;
  email: string;
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
  host: Host;
  revoker: string | null;
}

export interface CertificationResponse {
  certifications: Certification[];
  total: number;
}

// Detail certificate interface
export interface CertificateDetail {
  id: string;
  applicationId: string;
  hostId: number;
  certificateNumber: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
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
  application: {
    id: string;
    hostId: number;
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
    phone?: string;
    profileImage?: string;
  };
  revoker: {
    id: number;
    name: string;
    email: string;
  } | null;
}
export interface CertificateFilters {
  issuedAt?: string;
  expiredAt?: string;
  status?: "ACTIVE" | "REVOKED" | "EXPIRED";
  take?: number;
  skip?: number;
}