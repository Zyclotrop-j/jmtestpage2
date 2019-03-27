import React from 'react';
import { Link, graphql } from 'gatsby';
import styled from 'styled-components';
import { Transition, config as animationConfig } from 'react-spring/renderprops';
import { Layout, Wrapper, Button, Article } from '../components';
import PageProps from '../models/PageProps';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import { media } from '../utils/media';
import rgba from 'polished/lib/color/rgba';
import darken from 'polished/lib/color/darken';
import lighten from 'polished/lib/color/lighten';

const Homepage = styled.main`
  display: flex;
  height: 100vh;
  flex-direction: row;
  @media ${media.tablet} {
    height: 100%;
    flex-direction: column;
  }
  @media ${media.phone} {
    height: 100%;
    flex-direction: column;
  }
`;

const GridRow: any = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props: any) =>
    props.background
      ? `linear-gradient(
      -185deg,
      ${rgba(darken(0.1, props.theme.colors.secondary), 0.7)},
      ${rgba(lighten(0.1, props.theme.colors['color-primary-4']), 0.9)})`
      : null};
  background-size: cover;
  padding: 2rem 4rem;
  color: ${(props: any) => (props.background ? props.theme.colors.white : null)};
  h1 {
    color: ${(props: any) => (props.background ? props.theme.colors.white : null)};
  }
  @media ${media.tablet} {
    padding: 3rem 3rem;
  }
  @media ${media.phone} {
    padding: 2rem 1.5rem;
  }
`;

const HomepageContent: any = styled.div`
  max-width: 30rem;
  text-align: ${(props: any) => (props.center ? 'center' : 'left')};
`;

const ContactIcon: any = styled.div`
  position: relative;
  width: 15px;
  box-sizing: content-box;
  div {
    top: -7.5px;
    left: -7.5px;
    color: ${(props: any) => props.theme.colors.white};
    position: absolute;
    margin-left: 2px;
    margin-top: 4px;
    width: 15px;
    height: 10px;
    border-radius: 1px;
    border: solid 1px ${(props: any) => props.theme.colors.white};
  }
  div:before {
    content: '';
    position: absolute;
    left: 7px;
    top: -4px;
    width: 1px;
    height: 10px;
    background-color: ${(props: any) => props.theme.colors.white};
    -webkit-transform-origin: bottom;
    transform-origin: bottom;
    -webkit-transform: rotate(-54deg);
    transform: rotate(-54deg);
  }
  div:after {
    content: '';
    position: absolute;
    left: 7px;
    top: -4px;
    width: 1px;
    height: 10px;
    background-color: ${(props: any) => props.theme.colors.white};
    -webkit-transform-origin: bottom;
    transform-origin: bottom;
    -webkit-transform: rotate(54deg);
    transform: rotate(54deg);
  }
`;

const BlogIcon = styled.div`
  position: relative;
  width: 15px;
  box-sizing: content-box;
  div {
    top: -7.5px;
    left: -7.5px;
    color: ${(props: any) => props.theme.colors.white};
    position: absolute;
    margin-left: 4px;
    margin-top: 7px;
    width: 14px;
    height: 2px;
    border-radius: 1px;
    border: solid 1px ${(props: any) => props.theme.colors.white};
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
  div:before {
    content: '';
    position: absolute;
    left: -12px;
    top: -1px;
    width: 0px;
    height: 0px;
    border-left: solid 5px transparent;
    border-right: solid 5px ${(props: any) => props.theme.colors.white};
    border-top: solid 2px transparent;
    border-bottom: solid 2px transparent;
  }
`;

export default class IndexPage extends React.Component<PageProps> {
  public render() {
    const { data } = this.props;
    const { edges, totalCount } = data.allMarkdownRemark;
    return (
      <Wrapper fullWidth={true}>
        <Helmet title={`Homepage | ${config.siteTitle}`} />
        <Homepage>
          <GridRow background={true}>
            <HomepageContent center={true}>
              {config.siteLogo && <img src={config.siteLogo} alt={config.siteLogoAlt} />}
              <h1>
                Hi. I am <br />
                Jannes
              </h1>
              <p>This is a test-website :) </p>
              <Link to="/contact">
                <Button big={true}>
                  <ContactIcon>
                    <div />
                  </ContactIcon>
                  Contact
                </Button>
              </Link>
              <Link to="/blog">
                <Button big>
                  <BlogIcon>
                    <div />
                  </BlogIcon>
                  Blog
                </Button>
              </Link>
            </HomepageContent>
          </GridRow>
          <GridRow>
            <HomepageContent>
              <h2>About Me</h2>
              <p>..... some text .......</p>
              <hr />
              <h2>Latest Blog</h2>
              {edges.map(post => (
                <Article
                  title={post.node.frontmatter.title}
                  date={post.node.frontmatter.date}
                  excerpt={post.node.excerpt}
                  timeToRead={post.node.timeToRead}
                  slug={post.node.fields.slug}
                  category={post.node.frontmatter.category}
                  key={post.node.fields.slug}
                />
              ))}
              <p className={'textRight'}>
                <Link to={'/blog'}>All articles ({totalCount})</Link>
              </p>
            </HomepageContent>
          </GridRow>
        </Homepage>
      </Wrapper>
    );
  }
}
export const IndexQuery = graphql`
  query {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }, limit: 1) {
      totalCount
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "DD.MM.YYYY")
            category
          }
          timeToRead
        }
      }
    }
  }
`;
