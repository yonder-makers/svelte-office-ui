import App from './App.svelte';
import { registerEffects } from './pages/my-time-registration/store/effects';
import { startPersistance } from './state/persist';
// import 'carbon-web-components/es/components/dropdown/dropdown.js';
// import 'carbon-web-components/es/components/dropdown/dropdown-item.js';

startPersistance();
registerEffects();

const app = new App({
  target: document.body,
  props: {},
});

export default app;
