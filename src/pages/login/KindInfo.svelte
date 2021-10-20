<script lang="ts">
  import { Tile } from 'carbon-components-svelte';
</script>

<Tile>
  <h3>Welcome</h3>
  <p>
    This project is powered by <strong>Yonder Makers opensource</strong> community.
    If you want to get involved contact Toni Simu or Răzvan Dragomir.
  </p>
  <p>
    This project is a POC. It might <span class="crash"
      >crash or it might lack features</span
    >. Help us making it better.
  </p>
  <p>Contributers so far:</p>
  <ul>
    <li>
      <strong>Product Owner/RA (WANTED)</strong> - define features, create backlog,
      prioritize bugs
    </li>
    <li>
      <strong>UX/UI WANTED</strong> - create an attractive interface so we finally
      enjoy doing Time Registration
    </li>
    <li>
      <strong>Tech lead</strong> - Răzvan Dragomir - technical decisions, code reviews
    </li>
    <li>
      <strong>Developers (WANTED)</strong> - implement features, fix bugs, learn
    </li>
    <li>
      <strong>Tester (WANTED)</strong> - find bugs, detect usecases that crashes
      the application
    </li>
    <li>
      <strong>DevOps (WANTED)</strong> - keep an eye on the production server, improve
      deployment process
    </li>
    <li>
      <strong>Opensource spirit keeper</strong> - Toni Simu - engage with the community
    </li>
  </ul>
</Tile>

<style>
  ul {
    margin-left: 20px;
  }
  li {
    list-style-type: disc;
  }
  .crash {
    color: red;
  }

  p {
    margin-bottom: 4px;
  }
</style>
