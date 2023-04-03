interface GetConfigResponse {
  apiUrl: string;
  webOfficeUrl: string;
}

export async function getConfig() {
  // we load a local configuration file which is next to the svelte bundle
  // usually this config.json file is created at startup-time based on environment variables

  const configResponse = await fetch('/config.json', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return (await configResponse.json()) as GetConfigResponse;
}
