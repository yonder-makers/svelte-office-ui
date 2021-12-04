<script lang="ts">
  import { ImageLoader, InlineLoading, Tag } from 'carbon-components-svelte';

  interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
  }

  async function fetchContributors() {
    const response = await fetch(
      'https://api.github.com/repos/yonder-makers/weboffice-ui-svelte/contributors'
    );

    return (await response.json()) as Contributor[];
  }

  let contributors$ = fetchContributors();
</script>

{#await contributors$}
  <InlineLoading status="active" description="Loading" />
{:then contributors}
  <h4>Contributors <Tag type="green">{contributors.length}</Tag></h4>
  <ul>
    {#each contributors as contributor}
      <li>
        <a class="item" href={contributor.html_url}>
          <div class="avatar">
            <ImageLoader
              class="avatar"
              ratio="1x1"
              src={contributor.avatar_url}
            />
          </div>
          <span>{contributor.login}</span>
        </a>
      </li>
    {/each}
  </ul>
{:catch error}
  Something went wrong: {error.message}
{/await}

<style>
  ul {
    margin-left: 0;
  }

  li {
    margin-bottom: 4px;
  }

  .item {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
  }

  .avatar {
    display: inline-block;
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }
  span {
    flex: 1;
  }
</style>
