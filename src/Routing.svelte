<script lang="ts">
  import Router,{ replace } from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { getProfile } from './apis/auth-api';
  import EmployeesListPage from './pages/employees/EmployeesList.svelte';
  import LoginPage from './pages/login/LoginPage.svelte';
  import ManageAssignmentsPage from './pages/manage-assignments/ManageAssignmentsPage.svelte';
  import ManagePage from './pages/manage-projects/ManagePage.svelte';
import MyTimeRegistrationPage from './pages/my-time-registration/MyTimeRegistrationPage.svelte';
  import NotFoundPage from './pages/not-found/NotFoundPage.svelte';
  import LogPage from './pages/time-table/TimeTablePage.svelte';
  import { authState } from './state/auth/auth.state';


const authCondition = async ()=>{
  try{
    const profile = await getProfile($authState);
    return profile.user != undefined;
  }
  catch{
    
    return false;
  }
}

  const routes = {
    '/': ManagePage,
    '/my-tr': wrap({
      component:MyTimeRegistrationPage,
      conditions: [authCondition]
    }),
    '/login': LoginPage,
    '/manage': wrap({
      component: ManagePage,
      conditions: [authCondition]
    }),
    '/employees': EmployeesListPage,
    '/assignments': wrap({
      component: ManageAssignmentsPage,
      conditions: [
        authCondition
      ]}),
    '/log': LogPage,
    '*': NotFoundPage,
  };

  function conditionsFailed(event) {
    console.log('not auth')
      replace('/login')
  }
</script>

<Router {routes} on:conditionsFailed={conditionsFailed} />


