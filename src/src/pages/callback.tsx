import React, { Component } from 'react';
import { navigate } from 'gatsby';
import { auth } from '../utils/auth';

export default class Callback extends Component {
  componentDidMount() {
    if (/access_token|id_token|error/.test(location.hash)) {
      auth.handleAuthentication().then(i => {
        navigate(i.pathname, { replace: true });
      });
    }
  }

  render() {
    const hash = typeof location !== 'undefined' && location && location.hash;
    return <div>{/access_token|id_token|error/.test(hash) ? 'Logging in....' : 'What are you doing here?'}</div>;
  }
}
