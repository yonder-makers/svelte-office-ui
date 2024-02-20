let registered = false;
export function registerEffects() {
  if (registered) {
    return;
  }
  registered = true;
}
