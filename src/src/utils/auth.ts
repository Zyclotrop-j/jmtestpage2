import auth0 from 'auth0-js';
import { observable, runInAction, action } from "mobx";

export default class Auth {
  accessToken = observable(new Map());
  idToken = observable(new Map());
  expiresAt = observable(new Map());
  authResult = observable(new Map());

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.renewSession = this.renewSession.bind(this);
  }

  // // TODO: Get these into env-vars
  auth0 = new auth0.WebAuth({
    domain: 'jannes.eu.auth0.com',
    clientID: 'ERsPWL3VKrVGWmIZhQ30otK6h4hqv3jI',
    redirectUri: 'http://localhost:8000/callback',
    responseType: 'token id_token',
    scope: 'openid email profile'
  });

  login() {
    localStorage.setItem("auth0Path", `${location.pathname}`);
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise((res, rej) => {
      const pathname = localStorage.getItem("auth0Path");
      this.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          res({ ...authResult, pathname });
        } else if (err) {
          console.error(err);
          rej(err);
        }
      });
    })
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
    let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    runInAction(() => {
      this.accessToken = authResult.accessToken;
      this.idToken = authResult.idToken;
      this.authResult = authResult;
      this.expiresAt = expiresAt;
    });
  }

  renewSession() {
    return new Promise((res, rej) => {
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
    });
  }

  logout() {
    // Remove tokens and expiry time
    runInAction(() => {
      this.accessToken = null;
      this.idToken = null;
      this.expiresAt = 0;
    });
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    this.auth0.logout({
      returnTo: window.location.origin
    });
    return Promise.resolve();
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }
}

export const auth = new Auth();
