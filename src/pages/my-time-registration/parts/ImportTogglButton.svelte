<script lang="ts">
  import {
    Button,
    Modal,
    PasswordInput,
    TextInput,
  } from 'carbon-components-svelte';
  import { login } from '../../../apis/toggl';

  let isUserAuthenticatedWithToggl = false;
  let isImportInProgress = false;
  let openTogglLogin = false;
  let username = '';
  let password = '';
  let togglFullName = '';

  function startInport() {
    isImportInProgress = true;
    if (!isUserAuthenticatedWithToggl) {
      openTogglLogin = true;
    }
  }

  function resetFlags() {
    isImportInProgress = false;
    openTogglLogin = false;
  }

  async function onSubmit() {
    const loginInfo = await login(username, password);
    if (loginInfo.id) {
      resetFlags();
      isUserAuthenticatedWithToggl = true;
      togglFullName = loginInfo.fullName;
    }
  }
</script>

<Button disabled={isImportInProgress} on:click={startInport}
  >Import from Toggl</Button
>
{#if isUserAuthenticatedWithToggl === true}
  <span>{togglFullName}</span>
{/if}

<Modal
  bind:open={openTogglLogin}
  modalHeading="Toggl Login"
  primaryButtonText="Login"
  secondaryButtonText="Cancel"
  on:click:button--secondary={onSubmit}
  on:open
  on:close={onSubmit}
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
