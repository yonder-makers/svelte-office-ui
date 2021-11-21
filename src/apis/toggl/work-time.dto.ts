import type { TaskDto } from '../tasks.api';

export interface WorkTimeDto {
  task: TaskDto;
  timeEntries: {
    entryDay: string;
    duration: number;
  }[];
}
