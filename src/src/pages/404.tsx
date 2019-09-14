import * as React from 'react';
import { Wrapper } from '../components';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';
import { navigate } from '@reach/router';
import defer from "lodash/defer";
import { auth } from '../utils/auth';
import { ContactForm } from "../Widget"

export default class NotFoundPage extends React.Component<any> {

  public componentDidMount() {
    if (/access_token|id_token|error/.test(location.hash)) {
      auth.handleAuthentication().then(i => {
        navigate(i.pathname, { replace: true });
      });
    }
  }

  public render() {
    const { location: { state } } = this.props;
    const hash = typeof location !== 'undefined' && location && location.hash;
    if(/access_token|id_token|error/.test(hash)) {
      return (<h1 role="alert" aria-busy="true">Logging in....</h1>);
    }
    if(state?.redirect) {
      defer(() => navigate(state?.redirect));
      return (<h1>Redirecting....</h1>);
    }
    /*
      Use like: navigate("/login", { state: { content: <><h1>Logging you in....</h1></>, callback: () => auth.login(`${location.pathname}`) } })
    */
    if(state?.callback) {
      defer(state?.callback);
      return state?.content || (<h1>Working....</h1>);
    }
    return (
      <Wrapper>
        <h1>NOT FOUND</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </Wrapper>
    );
  }
}
