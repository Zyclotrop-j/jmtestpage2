import * as React from 'react';
import { Wrapper } from '../components';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';

const sample = `
graph LR
    Start --> Stop
`;

export default class NotFoundPage extends React.Component<any> {
  public render() {
    return (
      <Wrapper>
        <h1>NOT FOUND</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </Wrapper>
    );
  }
}
