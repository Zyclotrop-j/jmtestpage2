import * as React from 'react';
import { Content, Header, Layout, Wrapper } from '../components';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';

export default class IndexPage extends React.Component<any> {
  public render() {
    return (
      <Wrapper>
        <Header>
          <Anchor as={Link} href="/" to="/">
            {config.siteTitle}
          </Anchor>
        </Header>
        <Content>
          <h1>INDEX</h1>
          <p>Basic debug index</p>
        </Content>
      </Wrapper>
    );
  }
}
