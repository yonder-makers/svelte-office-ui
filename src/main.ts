import App from './App.svelte';
import { registerEffects } from './pages/my-time-registration/store/effects';
import { startPersistance } from './state/persist';

startPersistance();
registerEffects();

const app = new App({
  target: document.body,
  props: {},
});

export default app;
