<script lang="ts">
  import Router, { replace } from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { getProfile } from './apis/auth-api';
  import EmployeesListPage from './pages/employees/EmployeesList.svelte';
  import LoginPage from './pages/login/LoginPage.svelte';
  import WelcomePage from './pages/welcome/WelcomePage.svelte';
  import MyTimeRegistrationPage from './pages/my-time-registration/MyTimeRegistrationPage.svelte';
  import NotFoundPage from './pages/not-found/NotFoundPage.svelte';
  import { authState } from './state/auth/auth.state';

  const authCondition = async () => {
    try {
      const profile = await getProfile($authState);
      return profile.user != undefined;
    } catch {
      return false;
    }
  };

  const routes = {
    '/': WelcomePage,
    '/login': LoginPage,
    '/my-tr': wrap({
      component: MyTimeRegistrationPage,
      conditions: [authCondition],
    }),
    '/employees': EmployeesListPage,
    '*': NotFoundPage,
  };

  function conditionsFailed(event) {
    console.log('not auth');
    replace('/login');
  }
</script>

<Router {routes} on:conditionsFailed={conditionsFailed} />
