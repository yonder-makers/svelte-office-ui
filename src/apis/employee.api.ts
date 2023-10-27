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

export interface EmployeeHistoryDto {
  historyId: number;
  id: string;
  yoShort: string;
  name: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  hireDate: string;
  position: string;
  picture: string;
  created: string;
  createdBy: string;
  dateStart: string;
  dateEnd?: string;
  departmentName: string;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const webOfficeUrl = get(authState).webOfficeUrl;
  const response = await doGet<EmployeeDto[]>('/api/employees');
  return response
    .sort(
      (a, b) =>
        a.firstName.localeCompare(b.firstName) ||
        a.lastName.localeCompare(b.lastName),
    )
    .map((employee) => {
      return {
        ...employee,
        picture: employee.picture.includes('/.jpg')
          ? '/assets/images/user-avatar.png'
          : `${webOfficeUrl}${employee.picture}`,
        hireYear: employee.hireDate.substring(6, 10),
        hireMonth: employee.hireDate.substring(3, 5),
        birthYear: employee.birthDate.substring(6, 10),
        birthMonth: employee.birthDate.substring(3, 5),
      };
    });
}

export async function fetchEmployeeHistory(
  yoShort: string,
  signal?: AbortSignal,
): Promise<EmployeeHistoryDto[]> {
  const webOfficeUrl = get(authState).webOfficeUrl;
  const response = await doGet<EmployeeHistoryDto[]>(
    `/api/employees/${yoShort}/history`,
    undefined,
    signal,
  );

  return response.map((employee) => {
    return {
      ...employee,
      picture: employee.picture.includes('/.jpg')
        ? '/assets/images/user-avatar.png'
        : `${webOfficeUrl}${employee.picture}`,
    };
  });
}
