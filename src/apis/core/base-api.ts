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

export async function doPost<TResult>(
  relativeUrl: string,
  body: object,
  signal?: AbortSignal,
) {
  const fullUrl = resolveApiURL(relativeUrl).href;
  const result = await fetch(fullUrl, {
    body: JSON.stringify(body),
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthTokenHeaders(),
    },
    signal,
  });

  const response = await result.json();
  if (response.errorCode) {
    throw response;
  }

  return response as TResult;
}

export async function doPut<TResult>(
  relativeUrl: string,
  body: object,
  signal?: AbortSignal,
) {
  const fullUrl = resolveApiURL(relativeUrl).href;
  const result = await fetch(fullUrl, {
    body: JSON.stringify(body),
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthTokenHeaders(),
    },
    signal,
  });

  const response = await result.json();
  if (response.errorCode) {
    throw response;
  }

  return response as TResult;
}

export async function doPostWithoutResponse(
  relativeUrl: string,
  body: object,
  signal?: AbortSignal,
) {
  const fullUrl = resolveApiURL(relativeUrl).href;
  const result = await fetch(fullUrl, {
    body: JSON.stringify(body),
    method: 'post',
    headers: {
      ...getAuthTokenHeaders(),
    },
    signal,
  });
}

const getUrlWithParams = (
  fullUrl: string,
  params?: Record<string, string>,
): URL => {
  const url = new URL(fullUrl);
  if ((params ?? undefined) === undefined) {
    return url;
  }

  for (const param in params) {
    url.searchParams.append(param, params[param]);
  }

  return url;
};

export async function doGet<TResult>(
  relativeUrl: string,
  params?: Record<string, string>,
  signal?: AbortSignal,
) {
  const fullUrl = resolveApiURL(relativeUrl).href;

  const result = await fetch(getUrlWithParams(fullUrl, params).toString(), {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthTokenHeaders(),
    },
    signal,
  });

  const response = await result.json();
  if (response.errorCode) {
    throw response;
  }

  return response as TResult;
}

export async function doDelete<TResult>(
  relativeUrl: string,
  params?: Record<string, string>,
  signal?: AbortSignal,
) {
  const fullUrl = resolveApiURL(relativeUrl).href;

  const result = await fetch(getUrlWithParams(fullUrl, params).toString(), {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthTokenHeaders(),
    },
    signal,
  });

  const response = await result.json();
  if (response.errorCode) {
    throw response;
  }

  return response as TResult;
}
