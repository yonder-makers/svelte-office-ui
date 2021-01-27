<script lang="ts">
  import { fetchProjects } from './../apis/project-api';
  import { onMount } from 'svelte';
  import ProjectsList from './ProjectsList.svelte';
  import AddNewProjectForm from './AddNewProjectForm.svelte';
  import { projectsLoaded, projectsLoading } from '../state/actions';
  import { isLoading } from '../state/selectors';

  onMount(async () => {
    projectsLoading();
    let projects = await fetchProjects();
    projectsLoaded(projects);
  });
</script>

<h3>Projects</h3>
{#if $isLoading}
  <p>Please wait</p>
{:else}
  <ProjectsList />
{/if}

<button on:click={projectsLoading}>Loading</button>

<AddNewProjectForm />
