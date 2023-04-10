export interface FilterItem {
    value: string;
    text: string;
    selected: boolean;
  }

  export interface ActiveFilters {
    position: FilterItem[],
    hireYear: FilterItem[],
    hireMonth: FilterItem[],
    birthYear: FilterItem[],
    birthMonth: FilterItem[],
  }