<script lang="ts">
  import {
    loggedInToggl,
    isUserAuthenticatedInToggl,
  } from '@svelte-office/state';

  import {
    Button,
    Modal,
    PasswordInput,
    TextInput,
  } from 'carbon-components-svelte';
  import { get } from 'svelte/store';
  import {startTogglImport} from "../store"
  import {togglLogin} from "@svelte-office/api"

  let isImportInProgress = false;
  let openTogglLogin = false;
  let username = '';
  let password = '';

  async function startInport() {
    isImportInProgress = true;
    if ($isUserAuthenticatedInToggl === false) {
      openTogglLogin = true;
      return;
    }

    await importData();
  }

  async function importData() {
    await startTogglImport();
    isImportInProgress = false;
  }

  function resetFlags() {
    isImportInProgress = false;
    openTogglLogin = false;
  }

  async function onSubmit() {
    const loginResult = await togglLogin(username, password);
    loggedInToggl(loginResult.accessToken);
    openTogglLogin = false;
    resetFlags();
    await importData();
  }
</script>

<Button disabled={isImportInProgress} on:click={startInport}
  >Import from Toggl</Button
>
{#if $isUserAuthenticatedInToggl}
  <span>{$isUserAuthenticatedInToggl}</span>
{/if}

<Modal
  bind:open={openTogglLogin}
  modalHeading="Toggl Login"
  primaryButtonText="Login"
  secondaryButtonText="Cancel"
  on:click:button--secondary={resetFlags}
  on:open
  on:close={resetFlags}
  on:submit={onSubmit}
>
  <TextInput
    labelText="Your username"
    bind:value={username}
    placeholder="Enter your username"
  />
  <PasswordInput
    labelText="Password"
    bind:value={password}
    placeholder="Enter password..."
  />
</Modal>
