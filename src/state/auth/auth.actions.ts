import { getConfig } from '../../apis/config.api';
import { configurationLoaded } from './auth.state';

export async function loadConfiguration() {
  const config = await getConfig();
  configurationLoaded(config.apiUrl);
}
