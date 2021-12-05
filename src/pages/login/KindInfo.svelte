<script lang="ts">
  import { Tile } from 'carbon-components-svelte';
  import { apiUrlSelectorForPath } from '../../apis/resolvers/api-url.resolver';
  import Contributors from './Contributors.svelte';

  let swaggerApi = apiUrlSelectorForPath('/swagger/');
</script>

<Tile>
  <h2>Welcome</h2>
  <p>
    This project is powered by the <strong>Yonder Makers Opensource</strong> community.
  </p>
  <p>
    It is still in the POC stage. It might <span class="crash"
      >crash or it might lack features</span
    >. Help us make it better and
    <a href="https://github.com/yonder-makers/svelte-office-ui">
      get involved
    </a>.
  </p>
  <p>Technologies:</p>
  <ul>
    <li>
      Frontend: Svelte, TypeScript, Prettier, Rollup, date-fns, Fetch API,
      Carbon Design System, Hero Icons
    </li>
    <li>
      Backend: NestJS, rest api with JWT authentication, Swagger, CouchDB,
      Redis, Elasticsearch, Kibana, Filebeats, NginX, reverse engineered http
      requests from WebOffice
    </li>
    <li>
      Dev & deployment: VSCode + DevContainers, Docker, Github + Github Actions
      + Github Container Registry
    </li>
  </ul>
  <p>
    Feel free to create your own UI by using the API. Here is the swagger: <a
      href={$swaggerApi.href}>{$swaggerApi.href}</a
    >
  </p>
</Tile>
<Tile>
  <Contributors />
</Tile>

<style>
  h2 {
    margin-top: 1rem;
    font-size: 1.75rem;
    font-weight: 400;
    letter-spacing: 0;
    line-height: 1.28;
  }

  p {
    margin-top: 1.5rem;
  }

  ul {
    margin-left: 20px;
  }
  li {
    list-style-type: disc;
  }
  .crash {
    color: red;
  }
</style>
