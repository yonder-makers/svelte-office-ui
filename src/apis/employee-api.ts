import { doGet } from './core/base-api';

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

export async function fetchEmployees(): Promise<EmployeeDto[]> {
  const response = await doGet<EmployeeDto[]>('/api/employees');
  return response;
}
