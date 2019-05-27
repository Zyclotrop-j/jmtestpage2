import auth0 from 'auth0-js';
import { observable, runInAction, action, decorate, computed } from 'mobx';

class Auth {
  accessToken = {};
  idToken = {};
  expiresAt = {};
  authResult = {};
  initialized = false;

  // // TODO: Get these into env-vars
  auth0 = new auth0.WebAuth({
    domain: 'jannes.eu.auth0.com',
    clientID: 'ERsPWL3VKrVGWmIZhQ30otK6h4hqv3jI',
    redirectUri: 'http://localhost:8000/callback',
    responseType: 'token id_token',
    scope: 'openid email profile',
  });

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.renewSession = this.renewSession.bind(this);
  }

  login() {
    localStorage.setItem('auth0Path', `${location.pathname}`);
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise((res, rej) => {
      const pathname = localStorage.getItem('auth0Path');
      this.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          res({ ...authResult, pathname });
        } else if (err) {
          console.error(err);
          rej(err);
        }
      });
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  getIdToken() {
    return this.idToken;
  }

  getAuthResult() {
    return this.authResult;
  }

  setSession(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');

    // Set the time that the Access Token will expire at
    const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
    runInAction(() => {
      console.log("Setting", authResult);
      this.accessToken = authResult.accessToken;
      this.idToken = authResult.idToken;
      this.authResult = authResult;
      this.expiresAt = expiresAt;
      this.initialized = true;
    });
  }

  renewSession() {
    const res = new Promise((res, rej) => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        this.auth0.checkSession({}, (err, authResult) => {
          if (authResult && authResult.accessToken && authResult.idToken) {
            this.setSession(authResult);
            res(authResult);
          } else if (err) {
            this.logout();
            console.error(err);
            rej(err);
          }
        });
      } else {
        rej(`User not logged in; got value ${localStorage.getItem('isLoggedIn')} for isLoggedIn`);
      }
    });
    res.finally(() => {
      this.initialized = true;
    });
    return res;
  }

  logout() {
    // Remove tokens and expiry time
    runInAction(() => {
      this.accessToken = null;
      this.idToken = null;
      this.expiresAt = 0;
      this.initialized = true;
    });
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    this.auth0.logout({
      returnTo: window.location.origin,
    });
    return Promise.resolve();
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }
}

const DecoratedAuth = decorate(Auth, {
    accessToken: observable,
    idToken: observable,
    expiresAt: observable,
    authResult: observable,
    initialized: observable,
});

export default DecoratedAuth;
export const auth = new DecoratedAuth();
