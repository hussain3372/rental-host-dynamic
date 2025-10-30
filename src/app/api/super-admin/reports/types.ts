// ✅ Type for the user who generated the report
export interface GeneratedByUser {
  id: number;
  name: string;
  email: string;
}

// ✅ Type for a single report item
export interface ReportItem {
  id: string;
  reportType: "WEEKLY" | "MONTHLY" | "YEARLY" | string;
  startDate: string;
  endDate: string;
  certificationStatus: "ALL" | "APPROVED" | "PENDING" | "REJECTED" | string;
  fileName: string;
  filePath: string;
  fileSize: number;
  generatedBy: number;
  generatedAt: string;
  downloadedAt: string | null;
  downloadCount: number;
  isDeleted: boolean;
  deletedAt: string | null;
  generatedByUser: GeneratedByUser;
}

// ✅ Type for GET all reports response
export interface ReportListResponse {
  reports: ReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ Type for GET single report detail
export type ReportDetailResponse = ReportItem;

// ✅ Type for creating a report request
export interface CreateReportRequest {
  reportType: string;
  certificationStatus: string;
}

// ✅ Type for create report response (can reuse detail)
export type CreateReportResponse = ReportDetailResponse;

export interface ReportStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  expiringSoon: number;
}
export interface DeleteReport{
  success: boolean;
  message: string;
  data : string;
  fileName:string;
  filePath:string
}
