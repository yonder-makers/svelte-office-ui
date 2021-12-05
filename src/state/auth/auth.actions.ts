import { getProfile } from 'src/apis/auth.api';
import { getConfig } from '../../apis/config.api';
import { configurationLoaded, loggedOut } from './auth.state';

export async function loadConfiguration() {
  const config = await getConfig();
  configurationLoaded(config.apiUrl);
}

export async function checkAuthentication() {
  try {
    const profile = await getProfile();
    if (profile.user === undefined) {
      loggedOut();
    }
  } catch {
    loggedOut();
  }
}
