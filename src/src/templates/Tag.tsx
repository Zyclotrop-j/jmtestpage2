import React from 'react';
import Link from 'gatsby-link';
import PageProps from '../models/PageProps';
import { Article, Content, Header, Layout, SectionTitle, Subline, Wrapper } from '../components';
import Helmet from 'react-helmet';
import { Anchor } from 'grommet';
import config from '../../config/SiteConfig';
import kebabCase from 'lodash/kebabCase';

export default class TagTemplate extends React.PureComponent<PageProps> {
  public render() {
    const { posts, tagName } = this.props.pathContext;
    const totalCount = posts ? posts.length : 0;
    const subline = `${totalCount} post${totalCount === 1 ? '' : 's'} tagged with "${tagName}"`;

    return (
      <>
        <Helmet title={`${'Tags'} | ${config.siteTitle}`} />
        <Header>
          <Anchor as={Link} href="/" to="/">
            {config.siteTitle}
          </Anchor>
          <SectionTitle>Tag &ndash; {tagName}</SectionTitle>
          <Subline sectionTitle light={true}>
            {subline} (See{' '}
            <Anchor as={Link} href="/tags" to="/tags">
              all tags
            </Anchor>
            )
          </Subline>
        </Header>
        <Wrapper>
          <Content>
            {posts
              ? posts.map((post: any, index) => (
                  <Article
                    title={post.frontmatter.title}
                    date={post.frontmatter.date}
                    excerpt={post.excerpt}
                    slug={kebabCase(post.frontmatter.title)}
                    timeToRead={post.timeToRead}
                    category={post.frontmatter.category}
                    key={index}
                  />
                ))
              : null}
          </Content>
        </Wrapper>
      </>
    );
  }
}
