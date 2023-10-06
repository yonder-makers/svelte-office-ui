export interface ApiError {
  errorDescription: string;
  errorCode: string;
  httpStatusCode: number;
  timestamp: string;
  path: string;
}

export function isApiError(error: any): error is ApiError {
  return error && error.errorCode && error.errorDescription;
}
