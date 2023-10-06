import { doPost } from './core/base-api';
import { toWebOfficeFormat } from './core/date-utils';

export type GetAssistanceDto = {
  output: string;
};

export async function postGetAssistance(
  month: Date,
  question: string,
  signal?: AbortSignal,
): Promise<GetAssistanceDto> {
  const body = {
    year: month.getFullYear(),
    month: month.getMonth() + 1,
    question,
  };

  const response = await doPost<GetAssistanceDto>('/api/copilot', body, signal);
  return response;
}
