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

function parseEmployeeDate(date: string): { year: string; month: string } {
  // Handle both DD.MM.YYYY and DD-MM-YYYY formats
  const separator = date.includes('.') ? '.' : '-';
  const parts = date.split(separator);
  return {
    year: parts[2],
    month: parts[1]
  };
}

export async function fetchEmployees(): Promise<Employee[]> {
  const webOfficeUrl = get(authState).webOfficeUrl;
  const response = await doGet<any>('/api/employees');

  // Handle both array response and object response
  const employees = Array.isArray(response) ? response : (response.employees || []);

  return employees
    .sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName))
    .map((employee) => {
      const hireDateParsed = parseEmployeeDate(employee.hireDate);
      const birthDateParsed = parseEmployeeDate(employee.birthDate);

      return {
        ...employee,
        picture: employee.picture.includes('/.jpg') ? '/assets/images/user-avatar.png' : `${webOfficeUrl}${employee.picture}`,
        hireYear: hireDateParsed.year,
        hireMonth: hireDateParsed.month,
        birthYear: birthDateParsed.year,
        birthMonth: birthDateParsed.month,
      }
    });
}

export async function fetchCurrentEmployee(): Promise<Employee> {
  const webOfficeUrl = get(authState).webOfficeUrl;
  const response = await doGet<EmployeeDto>('/api/employees/me');

  const hireDateParsed = parseEmployeeDate(response.hireDate);
  const birthDateParsed = parseEmployeeDate(response.birthDate);

  return {
    ...response,
    picture: response.picture.includes('/.jpg') ? '/assets/images/user-avatar.png' : `${webOfficeUrl}${response.picture}`,
    hireYear: hireDateParsed.year,
    hireMonth: hireDateParsed.month,
    birthYear: birthDateParsed.year,
    birthMonth: birthDateParsed.month,
  };
}
