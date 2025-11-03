import { mount } from 'svelte';
import App from './App.svelte';
import { registerEffects } from './pages/my-time-registration/store/effects';
import { startPersistance } from './state/persist';

startPersistance();
registerEffects();

const app = mount(App, {
  target: document.body,
});

export default app;
