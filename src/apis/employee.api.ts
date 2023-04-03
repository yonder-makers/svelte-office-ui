import { authState } from '@svelte-office/state';
import { get } from 'svelte/store';
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
  const webOfficeUrl = get(authState).webOfficeUrl;
  const response = await doGet<EmployeeDto[]>('/api/employees');
  return response.map((employee) => { 
    return {
      ...employee,
      picture: employee.picture.includes('/.jpg') ? '/assets/images/user-avatar.png' : `${webOfficeUrl}${employee.picture}`
    }
  });
}
