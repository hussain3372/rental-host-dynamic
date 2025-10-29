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
