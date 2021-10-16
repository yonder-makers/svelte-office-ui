<script lang="ts">
  import { fetchProjects } from '../../apis/project-api';
  import { onMount } from 'svelte';
  import ProjectsList from './ProjectsList.svelte';
  import AddNewProjectForm from './AddNewProjectForm.svelte';
  import { projectsCount } from '../../state/selectors';

  onMount(async () => {
    // const hasProjects = $projectsCount > 0;
    // if (hasProjects) {
    //   return;
    // }
    // projectsLoading();
    // let projects = await fetchProjects();
    // projectsLoaded(projects);
  });
</script>

<h3>Projects</h3>

<ProjectsList />

<AddNewProjectForm />
