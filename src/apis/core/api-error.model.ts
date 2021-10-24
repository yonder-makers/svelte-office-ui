export interface ApiError {
  errorDescription: string;
  errorCode: string;
  httpStatusCode: number;
  timestamp: string;
  path: string;
}
