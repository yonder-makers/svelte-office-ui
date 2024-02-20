import { doGet, doPost } from './core/base-api';
import type { UserRole } from '../state/user-role';

export interface LoginResponse {
  accessToken: string;
  departmentContext: string;
  role: UserRole;
}

export async function login(username: string, password: string) {
  const body = { username, password };
  const loginResponse = await doPost<LoginResponse>('/api/login', body);

  return loginResponse;
}

interface GetProfileResponse {
  user: string;
  role: UserRole;
  departmentContext: string;
}

export async function getProfile() {
  const result = await doGet<GetProfileResponse>('api/profile');
  return result;
}
