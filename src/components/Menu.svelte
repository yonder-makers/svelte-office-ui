<script lang="ts">
  import { projectsCount } from '../state/selectors';
</script>

<ul>
  <li>Tasks</li>
  <li>YO12</li>
  <li>Projects {$projectsCount}</li>
</ul>

<style>
  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  li {
    padding: 0 0 0 4px;
  }
</style>
