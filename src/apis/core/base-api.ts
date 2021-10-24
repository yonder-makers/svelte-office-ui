import { resolveApiURL } from '../resolvers/api-url.resolver';
import { resolveAuthToken } from '../resolvers/auth-token.resolver';

function getAuthTokenHeaders() {
  const authToken = resolveAuthToken();
  return authToken
    ? {
        Authorization: 'Bearer ' + authToken,
      }
    : {};
}

export async function doPost<TResult>(relativeUrl: string, body: object) {
  const fullUrl = resolveApiURL(relativeUrl).href;
  const result = await fetch(fullUrl, {
    body: JSON.stringify(body),
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthTokenHeaders(),
    },
  });

  const response = await result.json();
  if (response.errorCode) {
    throw response;
  }

  return response as TResult;
}

export async function doGet<TResult>(relativeUrl: string) {
  const fullUrl = resolveApiURL(relativeUrl).href;
  const result = await fetch(fullUrl, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthTokenHeaders(),
    },
  });

  const response = await result.json();
  if (response.errorCode) {
    throw response;
  }

  return response as TResult;
}
