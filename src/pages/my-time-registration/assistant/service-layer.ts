import {
  getDaysInMonth,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
} from 'date-fns';
import { currentMonthState } from '../store';
import { get } from 'svelte/store';

export type TimeLog = {
  id: string;
  date: string;
  hours: number;
  taskNumber: number;
};

type PrintMessageAction = {
  type: 'print-message';
  message: string;
};

type AddOrUpdateTimeLogAction = {
  type: 'add-or-update-time-log';
  taskNumber: number;
  date: Date;
  hours: number;
};

type UpdateTimeLogAction = {
  type: 'update-time-log';
  id: string;
  hours: number;
};

type DeleteTimeLogAction = {
  type: 'delete-time-log';
  id: string;
};

export function parseAssistantDate(date: string): Date {
  return new Date(date);
}

export function formatAssistantDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export type ServiceLayerActions =
  | PrintMessageAction
  | AddOrUpdateTimeLogAction
  | UpdateTimeLogAction
  | DeleteTimeLogAction;

export class ServiceLayer {
  public actions: ServiceLayerActions[] = [];

  constructor(private timeLogs: TimeLog[]) {}

  printMessage(message: string): void {
    this.actions.push({
      type: 'print-message',
      message,
    });
  }
  getAllTimeLogs(): TimeLog[] {
    return this.timeLogs;
  }

  getDaysOfThisMonth(): Date[] {
    const days = eachDayOfInterval({
      start: startOfMonth(get(currentMonthState)),
      end: endOfMonth(get(currentMonthState)),
    });
    return days;
    // getDaysInMonth(get(currentMonthState));
  }

  addOrUpdateTimeLog(taskNumber: number, date: string, hours: number): void {
    this.actions.push({
      type: 'add-or-update-time-log',
      taskNumber: taskNumber,
      date: parseAssistantDate(date),
      hours,
    });
  }
  updateTimeLog(id: string, hours: number): void {
    this.actions.push({
      type: 'update-time-log',
      id,
      hours,
    });
  }
  deleteTimeLog(id: string): void {
    this.actions.push({
      type: 'delete-time-log',
      id,
    });
  }
}
