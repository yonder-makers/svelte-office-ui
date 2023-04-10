export function createFilterItemsFromString(
        source: Array,
        attr: string,
        fallbackText: string,
        selectedFilterItems: FilterItem[]
    ) {
      const selectedValues = selectedFilterItems.map((item) => item.value)
      const uniqueValues = Array.from(
        new Set(source.map((item) => item[attr])),
      ).sort((a, b) => a.localeCompare(b));
  
      const uniqueValuesFreq = source
        .map((item) => item[attr])
        .reduce((acc, curr) => {
          acc[curr] = (acc[curr] ?? 0) + 1;
          return acc;
        }, {});
  
      return uniqueValues.map((val) => {
        return {
          value: `${val}`,
          text: `${val || fallbackText} (${uniqueValuesFreq[val]})`,
          selected: selectedValues.includes(val)
        };
      });
}

export function createFilterItemsFromPartialString(
        source: Array,
        attr: string,
        stringIndexStart: number,
        stringIndexEnd: number,
        fallbackText: string,
        selectedFilterItems: FilterItem[],
        valueMapper?: Object
    ) {
      const selectedValues = selectedFilterItems.map((item) => item.value)
      const uniqueValues = Array.from(
        new Set(source.map((item) => item[attr].substring(stringIndexStart, stringIndexEnd))),
      ).sort((a, b) => a.localeCompare(b));
  
      const uniqueValuesFreq = source
        .map((item) => item[attr].substring(stringIndexStart, stringIndexEnd))
        .reduce((acc, curr) => {
          acc[curr] = (acc[curr] ?? 0) + 1;
          return acc;
        }, {});
  
      return uniqueValues.map((val) => {
        return {
          value: `${val}`,
          text: `${valueMapper ? valueMapper[val] : val || fallbackText} (${uniqueValuesFreq[val]})`,
          selected: selectedValues.includes(val)
        };
      });
}