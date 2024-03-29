import { doGet, doPost } from './core/base-api';

export type GetAssistanceDto = {
  output: string;
};

export async function postGetAssistance(
  month: Date,
  question: string,
  language: string,
  signal?: AbortSignal,
): Promise<GetAssistanceDto> {
  const body = {
    year: month.getFullYear(),
    month: month.getMonth() + 1,
    question,
    config: {
      language,
    },
  };

  const response = await doPost<GetAssistanceDto>('/api/copilot', body, signal);
  return response;
}

export type FetchCopilotPromptDto = {
  prompt: string;
};

export async function fetchCopilotPrompt() {
  const response = await doGet<FetchCopilotPromptDto>('/api/copilot/prompt');
  return response;
}
