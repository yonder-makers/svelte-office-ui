import { format, parse } from 'date-fns';

export function toWebOfficeFormat(value: Date) {
  return format(value, 'dd-MM-yyyy');
}

export function fromWebOfficeFormat(value: string) {
  return parse(value, 'dd-MM-yyyy', new Date());
}
