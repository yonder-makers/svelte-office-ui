<script lang="ts">
  import { Tile, CodeSnippet } from 'carbon-components-svelte';
  import { apiUrlSelectorForPath } from '../../apis/resolvers/api-url.resolver';

  let swaggerApi = apiUrlSelectorForPath('/');

  let dockerComposeCode = `
version: "3.3"  
services:
  frontend:
    image: ghcr.io/yonder-makers/weboffice-ui-svelte:latest
    environment:
      - API_URL=http://localhost:3000/
    ports:
      - "5000:5000"

  backend:
    image: ghcr.io/yonder-makers/weboffice-api:latest
    environment:
      - WEBOFFICE_URL=https://weboffice.yonder.local/
    ports:
      - "3000:3000"
`;
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
  <ul>
    <li>
      Product Owner/RA <strong> WANTED </strong>
    </li>
    <li>
      UX/UI <strong> WANTED</strong>
    </li>
    <li>
      Developers <strong> WANTED</strong>
    </li>
    <li>
      Testers <strong> WANTED</strong>
    </li>
  </ul>
  <p />
  <p>Technologies used:</p>
  <ul>
    <li>
      Frontend: Svelte, TypeScript, Prettier, Rollup, date-fns, Carbon Design
      System, Hero Icons
    </li>
    <li>
      Backend: NestJS, rest api with jwt authentication, reverse engineered http
      requests from weboffice
    </li>
    <li>
      Dev & deployment: VSCode + DevContainers, Docker, Github + Github Actions
      + Github Container Registry
    </li>
  </ul>
  <p />
</Tile>
<Tile>
  <p>
    Feel free to create your own UI by using the API. Here is the swagger: <a
      href={$swaggerApi.href}>{$swaggerApi.href}</a
    >
  </p>
</Tile>
<Tile>
  <p>Want to host it on your local machine? Here is the docker-compose file:</p>
  <CodeSnippet type="multi" code={dockerComposeCode} />
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
