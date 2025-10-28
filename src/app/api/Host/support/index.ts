// api/support/index.ts

import { apiClient, ApiResponse, DeleteRequestConfig } from "../../core/client";
import Cookies from "js-cookie";
import {
  CreateTicketPayload,
  CreateTicketResponse,
  GetTicketsResponse,
  Ticket
} from "./types";

const token = Cookies.get("accessToken");

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const supportApi = {
  // ✅ Create Ticket
  createTicket: async (
    payload: CreateTicketPayload
  ): Promise<ApiResponse<CreateTicketResponse>> => {
    return apiClient.post<CreateTicketResponse>("/support/tickets", payload, {
      headers: getAuthHeaders(),
    });
  },
  getTicketById: async (ticketId: string): Promise<ApiResponse<Ticket>> => {
    return apiClient.get<Ticket>(`/support/tickets/${ticketId}`, {
      headers: getAuthHeaders(),
    });
  },

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
    createdAt = ""
  } = params;

  let queryParams = `page=${page}&limit=${limit}`;
  
  if (search && search.trim() !== "") {
    queryParams += `&search=${encodeURIComponent(search)}`;
  }
  if (subject && subject.trim() !== "") {
    queryParams += `&subject=${encodeURIComponent(subject)}`;
  }
  if (property && property.trim() !== "") {
    queryParams += `&property=${encodeURIComponent(property)}`;
  }
  if (status && status.trim() !== "") {
    queryParams += `&status=${encodeURIComponent(status)}`;
  }
  if (createdAt && createdAt.trim() !== "") {
    queryParams += `&createdAt=${encodeURIComponent(createdAt)}`;
  }

  return apiClient.get<GetTicketsResponse>(
    `/support/tickets?${queryParams}`,
    {
      headers: getAuthHeaders(),
    }
  );
},
  deleteMultipleTickets: async (ticketIds: string[]): Promise<ApiResponse<void>> => {
    if (!ticketIds || ticketIds.length === 0) {
      throw new Error("No ticket IDs provided for deletion");
    }

    const config: DeleteRequestConfig = {
      headers: getAuthHeaders(),
      data: { ticketIds },
    };

    return apiClient.delete<void>("/support/tickets", config);
  },



};
