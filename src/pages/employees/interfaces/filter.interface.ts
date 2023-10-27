export interface FilterItem {
  value: string;
  text: string;
  selected: boolean;
}

export interface ActiveFilters {
  departmentName: FilterItem[];
  position: FilterItem[];
  hireYear: FilterItem[];
  hireMonth: FilterItem[];
  birthYear: FilterItem[];
  birthMonth: FilterItem[];
}
