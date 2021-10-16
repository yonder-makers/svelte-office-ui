import { API_URL } from '../constants';
import type { ApiSession } from './session.model';

export interface EmployeeDto {
  id: string;
  yoShort: string;
  name: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  hireDate: string;
  position: string;
  picture: string;
}

export async function fetchEmployees(
  apiSession: ApiSession
): Promise<EmployeeDto[]> {
  const result = await fetch(API_URL + 'api/employees', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiSession.accessToken,
    },
  });

  const response = await result.json();
  return response;
}
