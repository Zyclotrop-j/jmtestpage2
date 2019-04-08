import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'gatsby';
import { Layout, Wrapper, Header, Button, Content, SectionTitle } from '../components';

import config from '../../config/SiteConfig';
import PageProps from '../models/PageProps';

export default class ContactPage extends React.Component<PageProps> {
  public render() {
    return (
      <>
        <Helmet title={`Meet | ${config.siteTitle}`} />
        <Header>
          <Link to="/" state={{ toHome: true }}>
            {config.siteTitle}
          </Link>
          <SectionTitle uppercase={true}>Meet</SectionTitle>
        </Header>
        <Wrapper>
          <Content>
            <p>Super cool intro text to get people contacting me!</p>
            Put stuff here...
          </Content>
        </Wrapper>
      </>
    );
  }
}
