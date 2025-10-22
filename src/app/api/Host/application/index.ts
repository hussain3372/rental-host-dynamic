import { apiClient } from "../../core/client";
import { ApiResponse } from "../../core/client";
import {
  ApplicationData,
  ApplicationResponse,
  UpdatePayload,
  UpdateResponse,
  FileUploadResponse,
  UploadedDocument,
  PaymentPayload,
  PaymentResponse,
  SubmitResponse,
  // getApplicationByIdResponse,
  ApplicationsListResponse,
  ApiPayload,
} from "./types";
import Cookies from "js-cookie";
// Remove token from module level - get it fresh for each request
const getToken = (): string => {
  return Cookies.get("accessToken") || "";
};
const token = getToken();
// Define proper checklist interfaces
interface ApiChecklistItem {
  id: string | number;
  name: string;
  description?: string;
  isActive?: boolean;
  // Add other fields your API returns
}
interface CheckListApiResponse {
  data: ApiChecklistItem[];
  success: boolean;
  message?: string;
  status?: number;
}
export const application = {
  getApplications: async (
    params?: Partial<{
      ownership: string;
      status: string;
      submittedAt: string;
      currentStep: string;
      page: number;
      pageSize: number;
      search: string;
    }>
  ): Promise<ApiResponse<ApplicationsListResponse>> => {
    const token = getToken();

    const res = await apiClient.get<ApiResponse<ApplicationsListResponse>>(
      "/applications",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: params as Record<string, string | number | boolean | undefined>,
      }
    );

    if (res.status !== "success" && !res.success) {
      return {
        success: false,
        data: {
          applications: [],
          total: 0,
          status: "FAILED",
          message: res.message,
        },
        message: res.message,
        errors: null,
        meta: null,
      };
    }

    const payload = res.data || res;

    // Handle the backend pagination response
    const normalized: ApplicationsListResponse = {
      applications: payload.data?.applications ?? [],
      total: payload.data?.pagination?.total ?? payload.data?.total ?? 0,
      status: payload.status ?? "SUCCESS",
      message: payload.message ?? "",
      pagination: payload.data?.pagination // Include pagination info
    };

    return {
      success: true,
      data: normalized,
      message: res.message ?? "",
      errors: null,
      meta: null,
    };
  },
  getApplicationById: async (
    id: string
  ): Promise<ApiResponse<{ application: ApplicationData }>> => {
    return apiClient.get<{ application: ApplicationData }>(
      `/applications/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  // Existing methods
  getPropertyType: async (): Promise<ApiResponse<ApplicationData>> => {
    const token = getToken();
    return apiClient.get<ApplicationData>("/property-types", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createApplication: async (
    payload: ApplicationData
  ): Promise<ApiResponse<ApplicationResponse>> => {
    const token = getToken();
    console.log(
      ":outbox_tray: Sending JSON payload to /applications:",
      payload
    );
    return apiClient.post<ApplicationResponse>("/applications", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
  uploadImage: async (
    payload: FormData
  ): Promise<ApiResponse<FileUploadResponse>> => {
    const token = getToken();
    const stored = localStorage.getItem("applicationData");
    const id = stored ? JSON.parse(stored).id : null;
    return apiClient.post<FileUploadResponse>(
      `/applications/${id}/upload-images`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  uploadDocuments: async (
    payload: FormData
  ): Promise<ApiResponse<{ documents: UploadedDocument[] }>> => {
    const token = getToken();
    const stored = localStorage.getItem("applicationData");
    const id = stored ? JSON.parse(stored).id : null;
    return apiClient.post<{ documents: UploadedDocument[] }>(
      `/documents/upload/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  updateStep: async (
    payload: UpdatePayload
  ): Promise<ApiResponse<UpdateResponse>> => {
    const token = getToken();
    const stored = localStorage.getItem("applicationData");
    const id = stored ? JSON.parse(stored).id : null;
    return apiClient.put<UpdateResponse>(`/applications/${id}/step`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getCheckList: async (): Promise<ApiResponse<CheckListApiResponse>> => {
    const token = getToken();
    // More robust property type retrieval
    let propertyTypeId: string | null = null;
    try {
      // Try multiple sources for property type
      const storedAppData = localStorage.getItem("applicationData");
      if (storedAppData) {
        const appData = JSON.parse(storedAppData);
        propertyTypeId =
          appData.propertyType || appData.propertyDetails?.propertyType;
      }
      // Fallback to direct localStorage
      if (!propertyTypeId) {
        propertyTypeId = localStorage.getItem("propertyType");
      }
      // Fallback to form data in localStorage
      if (!propertyTypeId) {
        const formData = localStorage.getItem("formData");
        if (formData) {
          const parsedFormData = JSON.parse(formData);
          propertyTypeId = parsedFormData.propertyType;
        }
      }
      console.log(":mag: Property type search result:", propertyTypeId);
      if (!propertyTypeId) {
        throw new Error(
          "Property type not found. Please complete Step 1 first."
        );
      }
      // Clean up propertyTypeId - remove quotes if present
      propertyTypeId = propertyTypeId.replace(/['"]/g, "");
      console.log(
        `:rocket: Fetching checklist for property type: ${propertyTypeId}`
      );
      console.log(`:key: Using token: ${token ? "Present" : "Missing"}`);
      const response = await apiClient.get<CheckListApiResponse>(
        `/checklists/by-property-type/${propertyTypeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(":clipboard: Checklist API Response:", response);
      if (!response) {
        throw new Error("No response from checklist API");
      }
      return response;
    } catch (error) {
      console.error(":x: Checklist API Error:", error);
      // Provide more specific error messages
      if (error instanceof Error) {
        if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        ) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (error.message.includes("404")) {
          throw new Error(
            `No checklist found for the selected property type. Please contact support.`
          );
        } else if (error.message.includes("Network Error")) {
          throw new Error(
            "Network connection failed. Please check your internet connection."
          );
        }
      }
      throw error;
    }
  },
  mockPay: async (): Promise<ApiResponse<PaymentResponse>> => {
    const token = getToken();
    const stored = localStorage.getItem("applicationData");
    const applicationId = stored ? JSON.parse(stored).id : null;
    if (!applicationId) {
      throw new Error(
        "Application ID not found. Please complete Step 1 first."
      );
    }
    const payload: PaymentPayload = {
      amount: 1000,
      currency: "AED",
      applicationId: applicationId,
    };
    return apiClient.post<PaymentResponse>(`/payments/mock-pay`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
  // getApplicationById: async (): Promise<ApiResponse<getApplicationByIdResponse>> => {
  //   const token = getToken();
  //   const stored = localStorage.getItem("applicationData");
  //   const applicationId = stored ? JSON.parse(stored).id : null;
  //   return apiClient.get<getApplicationByIdResponse>(`/applications/${ applicationId }`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });
  // },
  submitApplication: async (): Promise<ApiResponse<SubmitResponse>> => {
    const token = getToken();
    const stored = localStorage.getItem("applicationData");
    const id = stored ? JSON.parse(stored).id : null;
    if (!id) {
      throw new Error(
        "Application ID not found. Please complete all previous steps."
      );
    }
    console.log(`Submitting application with ID: ${id}`);
    return apiClient.post<SubmitResponse>(
      `applications/${id}/submit`,
      undefined,
      {
        headers: {
          "Content-Type": "application /json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  updateApplication: async (
    payload: ApiPayload
  ): Promise<ApiResponse<UpdateResponse>> => {
    const token = getToken();
    const stored = localStorage.getItem("applicationData");
    const id = stored ? JSON.parse(stored).id : null;
    return apiClient.put<UpdateResponse>(`/applications/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
