import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import { Anchor } from 'grommet';
import { Layout, Wrapper, Header, SectionTitle, Content, Title } from '../components';

import config from '../../config/SiteConfig';
import PageProps from '../models/PageProps';

export default class AllCategoryTemplate extends React.PureComponent<PageProps> {
  public render() {
    const { categories } = this.props.pathContext;
    if (categories) {
      return (
        <>
          <Helmet title={`Categories | ${config.siteTitle}`} />
          <Header>
            <Anchor as={Link} href="/" to="/">
              {config.siteTitle}
            </Anchor>
            <SectionTitle>Categories</SectionTitle>
          </Header>
          <Wrapper>
            <Content>
              {categories.map((category, index: number) => (
                <Title key={index}>
                  <Anchor as={Link} href="/" to={`/categories/${kebabCase(category)}`}>
                    {category}
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
