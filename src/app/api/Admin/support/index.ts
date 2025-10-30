import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import {
  GetTicketsResponse,
  CreateTicketPayload,
  CreateTicketResponse,
  Ticket,
  UpdateTicketPayload,
  ImageUploadResponse
} from "./types";

const token = Cookies.get("adminAccessToken");

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// Image upload function
export const uploadImage = async (file: File): Promise<ApiResponse<ImageUploadResponse>> => {
  const formData = new FormData();
  formData.append("image", file);

  return apiClient.post<ImageUploadResponse>("/applications/image-upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Let the browser set Content-Type with boundary for FormData
    },
  });
};

export const supportApi = {
  // ✅ Create Ticket
  createTicket: async (
    payload: CreateTicketPayload
  ): Promise<ApiResponse<CreateTicketResponse>> => {
    return apiClient.post<CreateTicketResponse>(
      "/support/tickets",
      payload,
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Get Ticket by ID
  getTicketById: async (ticketId: string): Promise<ApiResponse<Ticket>> => {
    return apiClient.get<Ticket>(
      `/support/tickets/${ticketId}`,
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Get Tickets with filters
  getTickets: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    subject?: string;
    property?: string;
    status?: string;
    createdAt?: string;
  } = {}): Promise<ApiResponse<GetTicketsResponse>> => {
    const {
      page = 1,
      limit = 10,
      search = "",
      subject = "",
      property = "",
      status = "",
      createdAt = "",
    } = params;

    // Build query string safely
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search.trim()) query.append("search", search.trim());
    if (subject.trim()) query.append("subject", subject.trim());
    if (property.trim()) query.append("property", property.trim());
    if (status.trim()) query.append("status", status.trim());
    if (createdAt.trim()) query.append("createdAt", createdAt.trim());

    return apiClient.get<GetTicketsResponse>(
      `/support/tickets?${query.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Get Admin Tickets (Admin-specific endpoint)
  getAdminTickets: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    status?: string,
    createdAt?: string
  ): Promise<ApiResponse<GetTicketsResponse>> => {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (createdAt) params.append('createdAt', createdAt);

    return apiClient.get<GetTicketsResponse>(
      `/support/admin/tickets?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Delete Single Ticket
  deleteTicket: async (ticketId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/support/tickets/${ticketId}`, {
      headers: getAuthHeaders(),
    });
  },

  // ✅ Delete Multiple Tickets
  deleteMultipleTickets: async (ticketIds: string[]): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/support/tickets`, {
      headers: getAuthHeaders(),
      body: { ticketIds: ticketIds } 
    });
  },

  // ✅ Update Ticket
  updateTicket: async (
    ticketId: string,
    payload: UpdateTicketPayload
  ): Promise<ApiResponse<Ticket>> => {
    return apiClient.patch<Ticket>(
      `/support/tickets/${ticketId}`,
      payload,
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Update Ticket Status
  updateTicketStatus: async (
    ticketId: string,
    status: string
  ): Promise<ApiResponse<Ticket>> => {
    return apiClient.patch<Ticket>(
      `/support/tickets/${ticketId}`,
      { status },
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Assign Ticket to Admin
  assignTicket: async (
    ticketId: string,
    assignedTo: string
  ): Promise<ApiResponse<Ticket>> => {
    return apiClient.patch<Ticket>(
      `/support/tickets/${ticketId}`,
      { assignedTo },
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Resolve Ticket
  resolveTicket: async (
    ticketId: string,
    resolution: string
  ): Promise<ApiResponse<Ticket>> => {
    return apiClient.put<Ticket>(
      `/support/admin/tickets/${ticketId}/resolve`,
      {
        status: "RESOLVED",
        resolution,
        resolvedAt: new Date().toISOString()
      },
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Close Ticket
  closeTicket: async (ticketId: string): Promise<ApiResponse<Ticket>> => {
    return apiClient.patch<Ticket>(
      `/support/tickets/${ticketId}`,
      {
        status: "CLOSED",
        closedAt: new Date().toISOString()
      },
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Image Upload
  uploadImage,
};