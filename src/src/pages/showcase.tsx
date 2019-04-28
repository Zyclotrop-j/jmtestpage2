import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';
import { Layout, Wrapper, Header, Button, Content, SectionTitle } from '../components';

import { RichText } from '../Widget/RichText';
import { Teaser } from '../Widget/Teaser';

import config from '../../config/SiteConfig';
import PageProps from '../models/PageProps';

export default class ContactPage extends React.Component<PageProps> {
  public render() {
    return (
      <>
        <Helmet title={`Showcase | ${config.siteTitle}`} />
        <Header>
          <Anchor as={Link} href="/" to="/" state={{ toHome: true }}>
            {config.siteTitle}
          </Anchor>
          <SectionTitle uppercase={true}>Showcase</SectionTitle>
        </Header>
        <Wrapper>
          <Content>
            <p>Super cool intro text to get people contacting me!</p>
            Put stuff here...
            <RichText />
            <Teaser />
          </Content>
        </Wrapper>
      </>
    );
  }
}
