interface FilterItem {
  value: string;
  text: string;
  selected: boolean;
}

export function createFilterItemsFromString<T extends Record<string, any>>(
        source: T[],
        attr: string,
        fallbackText: string,
        selectedFilterItems: FilterItem[],
        valueMapper?: Record<string, string>
    ) {
      const selectedValues = selectedFilterItems.map((item) => item.value)
      const uniqueValues = Array.from(
        new Set(source.map((item: T) => item[attr])),
      ).sort((a: string, b: string) => a.localeCompare(b));
  
      const uniqueValuesFreq = source
        .map((item: T) => item[attr])
        .reduce((acc: Record<string, number>, curr: string) => {
          acc[curr] = (acc[curr] ?? 0) + 1;
          return acc;
        }, {});
  
      return uniqueValues.map((val: string) => {
        return {
          value: `${val}`,
          text: `${valueMapper ? valueMapper[val] : val || fallbackText} (${uniqueValuesFreq[val]})`,
          selected: selectedValues.includes(val)
        };
      });
}