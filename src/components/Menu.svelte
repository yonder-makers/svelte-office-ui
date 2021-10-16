<script lang="ts">
  import { projectsCount } from '../state/selectors';
</script>

<ul>
  <li><a href="#/my-tr">My TR</a></li>
  <li><a href="#/manage">Tasks</a></li>
  <li><a href="#/assignments">Assignments</a></li>
  <li><a href="#/log">YO12</a></li>
  <li><a href="#/blabla">Projects {$projectsCount}</a></li>
  <li><a href="#/employees">Employees</a></li>
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
