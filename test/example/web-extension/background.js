console.log("web-extension - background page loaded");

function authenticate() {
  const FXA_CLIENT_ID = 'ddd334467337344a';
  const FXA_OAUTH_SERVER = 'http://127.0.0.1:9010/v1'; // can be 'http://127.0.0.1:9010/v1' or remote server
  const REDIRECT = browser.identity.getRedirectURL(); // "https://cad3e32c651f62062e87b786f04c49bea007c8c3.extensions.allizom.org/"

  const fxaKeysUtil = new fxaCryptoRelier.OAuthUtils();
  fxaKeysUtil.launchFxaScopedKeyFlow({
    client_id: FXA_CLIENT_ID,
    oauth_uri: FXA_OAUTH_SERVER,
    pkce: true,
    redirect_uri: REDIRECT,
    scopes: ['profile', 'https://identity.mozilla.org/apps/scoped-example'],
  }).then((loginDetails) => {
    console.log('access token + keys', loginDetails);
  }, (err) => {
    console.log('login failed', err);
    throw err;
  });
}

browser.browserAction.onClicked.addListener((tab) => {
  authenticate();
});
