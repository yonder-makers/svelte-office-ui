<script lang="ts">
  import { login } from '../../apis/auth-api';
  import { loggedIn } from '../../state/auth/auth.state';

  import {
    FormGroup,
    PasswordInput,
    TextInput,
    Button,
    InlineLoading,
    Grid,
    Row,
    Column,
  } from 'carbon-components-svelte';

  let username = 'razvan';
  let password = '';

  let loadingStatus: 'inactive' | 'active' | 'finished' = 'inactive';

  async function submit() {
    if (username.length === 0) {
      return;
    }

    loadingStatus = 'active';
    const loginResult = await login(username, password);
    loggedIn(loginResult.accessToken);
    loadingStatus = 'finished';
    setTimeout(() => {
      // just to provide that nice experience so the user has the chance to
      // see the Success message
      location.href = '/#/my-tr';
      setTimeout(() => {
        location.reload();
      }, 100);
    }, 500);
  }
</script>

<Grid>
  <Row>
    <Column>
      <h2>Please login</h2>
    </Column>
  </Row>
  <Row>
    <Column sm={2} lg={4}>
      <FormGroup>
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
        {#if loadingStatus === 'inactive'}
          <Button on:click={submit}>Login</Button>
        {:else}
          <InlineLoading
            status={loadingStatus}
            description="Validating your credentials"
          />
        {/if}
      </FormGroup>
    </Column>
  </Row>
</Grid>
