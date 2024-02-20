<script lang="ts">
  import Router, { replace } from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { getProfile } from './apis/auth.api';
  import EmployeePage from './pages/employee/EmployeePage.svelte';
  import EmployeesListPage from './pages/employees/EmployeesList.svelte';
  import HolidaysPage from './pages/holidays/HolidaysPage.svelte';
  import LoginPage from './pages/login/LoginPage.svelte';
  import MyTimeRegistrationPage from './pages/my-time-registration/MyTimeRegistrationPage.svelte';
  import NotFoundPage from './pages/not-found/NotFoundPage.svelte';

  const authCondition = async () => {
    try {
      const profile = await getProfile();
      return profile.user != undefined;
    } catch {
      return false;
    }
  };

  const routes = {
    '/': wrap({
      component: MyTimeRegistrationPage,
      conditions: [authCondition],
    }),
    '/login': LoginPage,
    '/my-tr': wrap({
      component: MyTimeRegistrationPage,
      conditions: [authCondition],
    }),
    '/employees': wrap({
      component: EmployeesListPage,
      conditions: [authCondition],
    }),
    '/employees/:yoShort': wrap({
      component: EmployeePage,
      conditions: [authCondition],
    }),
    '/holidays': wrap({
      component: HolidaysPage,
      conditions: [authCondition],
    }),
    '*': NotFoundPage,
  };

  function conditionsFailed(event) {
    console.log('not auth');
    replace('/login');
  }
</script>

<Router {routes} on:conditionsFailed={conditionsFailed} />
