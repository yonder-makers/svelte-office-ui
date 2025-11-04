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

export interface Employee extends EmployeeDto {
  hireYear: string;
  hireMonth: string;
  birthYear: string;
  birthMonth: string;
}

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const webOfficeUrl = get(authState).webOfficeUrl;
    const response = await doGet<EmployeeDto[]>('/api/employees');
    
    if (!Array.isArray(response)) {
      throw new Error(`Invalid response format from employee API. Expected array, got: ${typeof response}`);
    }
    
    return response
      .sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName))
      .map((employee) => ({
        ...employee,
        picture: employee.picture.includes('/.jpg') ? '/assets/images/user-avatar.png' : `${webOfficeUrl}${employee.picture}`,
        hireYear: employee.hireDate.substring(6, 10),
        hireMonth: employee.hireDate.substring(3, 5),
        birthYear: employee.birthDate.substring(6, 10),
        birthMonth: employee.birthDate.substring(3, 5),
      }));
  } catch (error) {
    console.error('Error in fetchEmployees:', error);
    throw error;
  }
}
