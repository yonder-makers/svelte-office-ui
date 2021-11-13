const apiUrl = 'https://api.track.toggl.com/api/v8/';
export type LoginInfo = {
  id: bigint;
  email: string;
  fullName: string;
};

export async function login(
  username: string,
  password: string
): Promise<LoginInfo> {
  const result = await fetch(`${apiUrl}/sessions`, {
    body: '',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  });

  const response = await result.json();
  if (response.errorCode) {
    throw response;
  }

  return response;
}
