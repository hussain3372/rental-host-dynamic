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