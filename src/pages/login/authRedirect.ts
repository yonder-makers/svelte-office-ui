import * as msal from '@azure/msal-browser';
import { loginRequest, msalConfig } from './authConfig';

// configuration parameters are located at authConfig.js
const myMSALObj = new msal.PublicClientApplication(msalConfig);

let username = '';

/**
 * A promise handler needs to be registered for handling the
 * response returned from redirect flow. For more information, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/acquire-token.md
 */
myMSALObj
  .handleRedirectPromise()
  .then(handleResponse)
  .catch((error) => {
    console.error(error);
  });

function selectAccount() {
  /**
   * See here for more info on account retrieval:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */

  const currentAccounts = myMSALObj.getAllAccounts();

  if (currentAccounts.length === 0) {
    return;
  } else if (currentAccounts.length > 1) {
    // Add your account choosing logic here
    console.warn('Multiple accounts detected.');
  } else if (currentAccounts.length === 1) {
    username = currentAccounts[0].username;
    console.log('welcome', username);
  }
}

function handleResponse(response) {
  if (response !== null) {
    username = response.account.username;
    console.log('welcome', username);
  } else {
    selectAccount();
  }
}

export function signIn() {
  /**
   * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
   */

  myMSALObj.loginRedirect(loginRequest);
}

export function signOut() {
  /**
   * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
   */

  const logoutRequest = {
    account: myMSALObj.getAccountByUsername(username),
    postLogoutRedirectUri: msalConfig.auth.redirectUri,
  };

  myMSALObj.logoutRedirect(logoutRequest);
}

export function getTokenRedirect() {
  /**
   * See here for more info on account retrieval:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  const request = {
    ...loginRequest,
    account: myMSALObj.getAccountByUsername(username),
  };

  return myMSALObj.acquireTokenSilent(request).catch((error) => {
    console.warn(
      'silent token acquisition fails. acquiring token using redirect',
    );
    if (error instanceof msal.InteractionRequiredAuthError) {
      // fallback to interaction when silent call fails
      return myMSALObj.acquireTokenRedirect(request);
    } else {
      console.warn(error);
    }
  });
}

// function seeProfile() {
//   getTokenRedirect(loginRequest)
//     .then((response) => {
//       callMSGraph(graphConfig.graphMeEndpoint, response.accessToken, updateUI);
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

// function readMail() {
//   getTokenRedirect(tokenRequest)
//     .then((response) => {
//       callMSGraph(
//         graphConfig.graphMailEndpoint,
//         response.accessToken,
//         updateUI,
//       );
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }
