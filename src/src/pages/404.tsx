import * as React from 'react';
import { Content, Header, Layout, Wrapper } from '../components';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';

export default class NotFoundPage extends React.Component<any> {
  public render() {
    return (
      <Wrapper>
        <Helmet title={`404 not found | ${config.siteTitle}`} />
        <Header>
          <Anchor as={Link} href="/" to="/">
            {config.siteTitle}
          </Anchor>
        </Header>
        <Content>
          <h1>NOT FOUND</h1>
          <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
        </Content>
      </Wrapper>
    );
  }
}
