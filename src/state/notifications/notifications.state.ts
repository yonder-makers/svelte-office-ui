import { derived, writable } from 'svelte/store';

let id = 0;

export type NotificationKind = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  footer: string;
  kind: NotificationKind;
}
export const notificationsState = writable<NotificationItem[]>([]);

export const notifications = derived(notificationsState, (state) => {
  return state;
});

export function addNotification(
  title: string,
  description: string,
  footer: string,
  kind: NotificationKind = 'info',
) {
  const newId = id++;
  notificationsState.update((state) => {
    return [
      ...state,
      {
        id: newId,
        title,
        description,
        footer,
        kind,
      },
    ];
  });
}

export function closeNotification(id: number) {
  notificationsState.update((state) => {
    return state.filter((item) => item.id !== id);
  });
}
