import { httpClient, type HttpResponse } from './http';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthLoginResponse {
  user: AuthUser;
  token: string;
}

export interface AuthValidateResponse {
  user: AuthUser;
}

export async function registerUser(name: string, email: string, password: string): Promise<HttpResponse<AuthLoginResponse>> {
  return httpClient.post<AuthLoginResponse>('/auth/register', {
    username: name,
    email,
    password,
  });
}

export async function loginUser(email: string, password: string): Promise<HttpResponse<AuthLoginResponse>> {
  return httpClient.post<AuthLoginResponse>('/auth/login', {
    email,
    password,
  });
}

export async function validateAuthToken(): Promise<HttpResponse<AuthValidateResponse>> {
  return httpClient.get<AuthValidateResponse>('/auth/validate');
}

export async function logoutUser(): Promise<HttpResponse<{ message: string }>> {
  return httpClient.post<{ message: string }>('/auth/logout');
}
