export interface ProfileResponse {
  data: {

    id: number;
    email: string;
    role: string;
    emailVerified: boolean;
    firstName?: string;
    lastName?: string;
  }
}

export interface UpdateProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}
