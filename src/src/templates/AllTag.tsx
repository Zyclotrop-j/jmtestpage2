import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import { Anchor } from 'grommet';
import { Layout, Wrapper, Header, SectionTitle, Content, Title } from '../components';

import config from '../../config/SiteConfig';
import PageProps from '../models/PageProps';

export default class AllTagTemplate extends React.PureComponent<PageProps> {
  public render() {
    const { tags } = this.props.pathContext;
    if (tags) {
      return (
        <>
          <Helmet title={`Tags | ${config.siteTitle}`} />
          <Header>
            <Anchor as={Link} href="/" to="/">
              {config.siteTitle}
            </Anchor>
            <SectionTitle>Tags</SectionTitle>
          </Header>
          <Wrapper>
            <Content>
              {tags.map((tag, index: number) => (
                <Title key={index}>
                  <Anchor as={Link} href="/" to={`/tags/${kebabCase(tag)}`}>
                    {tag}
                  </Anchor>
                </Title>
              ))}
            </Content>
          </Wrapper>
        </>
      );
    }
  }
}
