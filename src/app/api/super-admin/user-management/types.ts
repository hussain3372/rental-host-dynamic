export interface UsersResponse {
  data: {
    id: number;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
    phone: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
      applications: number;
      certifications: number;
      supportTickets: number;
    };
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AddAdminResponse{
	message: string
	data: {
		id: number
		email: string
		firstName: string
		lastName: string
		role: string
		status: string
		createdAt: string
	}
}
export interface AddAdminPayload{
  name : string;
  email : string;
}