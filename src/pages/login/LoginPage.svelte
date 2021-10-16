<script lang="ts">
  import { login } from '../../apis/auth-api';
  import { loggedIn } from '../../state/auth/auth.state';
  // import { getTasks } from '../../apis/tasks-api';

  let username = 'razvan';
  let password = '';

  async function submit() {
    if (username.length === 0) {
      return;
    }

    const loginResult = await login(username, password);
    loggedIn(loginResult.accessToken);
  }
</script>

<h2>Login</h2>
<div>Username: <input type="text" bind:value={username} /></div>
<div>Password: <input type="password" bind:value={password} /></div>
<div><button on:click={submit}>Login</button></div>
