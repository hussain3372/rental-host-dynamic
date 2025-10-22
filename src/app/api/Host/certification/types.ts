export interface PropertyDetails {
  name?: string;
  rent: number;
  propertyName?: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  currency: string;
  description: string;
  propertyType?: string;
  maxGuests?: number;
  images: string[];
  size?: string;
  view?: string;
  floor?: number;
  rules?: string[];
  amenities?: string[];
  parking?: string;
  yearBuilt?: number;
  additionalInfo?: string;
  nearbyAttractions?: string[];
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

export interface Revoker {
  id: number;
  name: string;
  email: string;
}

export interface CertificationData {
  id: string;
  applicationId: string;
  hostId: number;
  certificateNumber: string;
  status: string;
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
  revoker?: Revoker | null;
}

export interface CertificationResponse {
  certifications: CertificationData[];
  total: number;
}
