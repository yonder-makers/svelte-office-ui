<script lang="ts">
  import {
    Button,
    Column,
    Form,
    Grid,
    InlineLoading,
    PasswordInput,
    Row,
    TextInput,
  } from 'carbon-components-svelte';
  import { login } from '../../apis/auth.api';
  import type { ApiError } from '../../apis/core/api-error.model';
  import { loggedIn } from '../../state/auth/auth.state';
  import KindInfo from './KindInfo.svelte';

  let username = '';
  let password = '';

  let loadingStatus: 'inactive' | 'active' | 'finished' | 'error' = 'inactive';
  let loadingDescription = '';

  function getErrorMessage(error?: ApiError) {
    if (!error || !error.errorCode) {
      return 'Something went wrong. Please try again';
    }

    switch (error.errorCode) {
      case 'WrongUsernameOrPassword':
        return 'Wrong username or password.';
      case 'YonderOfficeTimeout':
        return "Can't connect to WebOffice. Please check your VPN connection";
      default:
        return error.errorDescription;
    }
  }

  function afterLoginSuccessful() {
    setTimeout(() => {
      // just to provide that nice experience so the user has the chance to
      // see the Success message
      location.href = '/#/my-tr';
    }, 2000);
  }

  const onPressedKey = (event: KeyboardEvent) => {
    if (event.code === 'Enter') {
      submit();
    }
  };

  async function submit() {
    if (username.length === 0) {
      return;
    }

    loadingStatus = 'active';
    loadingDescription = 'Validating your credentials';

    try {
      const loginResult = await login(username, password);

      loggedIn(
        loginResult.accessToken,
        loginResult.role,
        loginResult.departmentContext,
      );

      loadingStatus = 'finished';
      loadingDescription =
        'Login successful. You will be redirected in a second';

      afterLoginSuccessful();
    } catch (error) {
      loadingStatus = 'error';
      loadingDescription = getErrorMessage(error);
    }
  }
</script>

<Grid>
  <Row>
    <Column sm={2} lg={5}>
      <h2>Please login</h2>
      <Form>
        <TextInput
          labelText="Your username"
          bind:value={username}
          placeholder="Enter your username"
        />
        <PasswordInput
          labelText="Password"
          bind:value={password}
          placeholder="Enter password..."
          autocomplete="on"
          on:keydown={onPressedKey}
        />
        {#if loadingStatus === 'inactive' || loadingStatus === 'error'}
          <Button on:click={submit}>Login</Button>
        {/if}
      </Form>
      {#if loadingStatus !== 'inactive'}
        <InlineLoading
          status={loadingStatus}
          description={loadingDescription}
        />
      {/if}
    </Column>
    <Column sm={2} lg={11}>
      <KindInfo />
    </Column>
  </Row>
</Grid>

<style>
</style>
