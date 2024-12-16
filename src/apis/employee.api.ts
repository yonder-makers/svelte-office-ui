import { authState } from '@svelte-office/state';
import { get } from 'svelte/store';
import { doGet, doPut } from './core/base-api';

export interface EmployeeDto {
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

export async function fetchEmployees(): Promise<EmployeeDto[]> {
  const response = await doGet<EmployeeDto[]>('/api/employees');
  return response;
}

export async function fetchEmployeeHistory(
  yoShort: string,
  signal?: AbortSignal,
): Promise<EmployeeDto[]> {
  const webOfficeUrl = get(authState).webOfficeUrl;
  const response = await doGet<EmployeeDto[]>(
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

type EmployeeUpdateRequest = {
  yoShort: string;
  departmentName?: string;
};

export async function putEmployee(employee: EmployeeUpdateRequest) {
  return await doPut<EmployeeDto>(
    `/api/employees/${employee.yoShort}`,
    employee,
  );
}

export async function fetchDepartmentNames(): Promise<string[]> {
  const response = await doGet<string[]>('/api/employees/departments');
  return response;
}
