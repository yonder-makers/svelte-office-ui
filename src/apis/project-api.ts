export interface ProjectDto {
  id: number;
  name: string;
  tasks: TaskModel[];
}

interface TaskModel {
  id: number;
  name: string;
  yoId: number;
}

export async function fetchProjects() {
  const result = await fetch('/data/projects.json');
  const projects = (await result.json()) as ProjectDto[];
  return projects;
}
