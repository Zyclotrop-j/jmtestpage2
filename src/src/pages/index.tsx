import React from 'react';
import { Link, graphql } from 'gatsby';
import styled from 'styled-components';
import { transitions } from 'polished';
import { Transition, config as animationConfig } from 'react-spring/renderprops';
import { Button, Heading, Paragraph, Text, Anchor, Grid } from 'grommet';
import { Apps, BlockQuote, ContactInfo } from 'grommet-icons';
import { Layout, Wrapper, Article, AboutMe } from '../components';
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

const IconHover = styled(Text)``;
const StyledAnchor = styled(Anchor)`
  color: ${props => props.color};
  transition: padding-left ${props => props.theme.global.transitionDuration} 0.3s;
  position: relative;
  &:hover {
    transition: padding-left ${props => props.theme.global.transitionDuration} 0s;
    padding-left: 1.5rem;
  }
`;

const IconPin = styled.div`
  left: 0;
  font-size: 10px;
  color: transparent;
  transition: color ${props => props.theme.global.transitionDuration} 0s;
  ${StyledAnchor}:hover & {
    transition: color ${props => props.theme.global.transitionDuration} 0.5s;
    color: white;
  }
  position: absolute;
  color: transparent;
  position: absolute;
  margin-left: 0.4em;
  margin-top: 0.2em;
  width: 1.2em;
  height: 1.2em;
  border: solid 0.1em currentColor;
  border-radius: 0.7em 0.7em 0.7em 0;
  transform: rotate(-45deg);
  &:before {
    content: '';
    position: absolute;
    left: 0.3em;
    top: 0.3em;
    width: 0.4em;
    height: 0.4em;
    border: solid 0.1em currentColor;
    border-radius: 0.3em;
  }
`;

const ContactIcon: any = styled.i`
  font-size: 0.8em;
  left: calc(-1.5em - 20px);
  position: relative;
  box-sizing: content-box;
  ${IconHover}:hover & {
    div {
      border: solid 0.1em ${(props: any) => props.theme.global.colors.white};
    }
    div::before {
      left: 0.7em;
      top: -0.4em;
      width: 0.1em;
      height: 1em;
    }
    div::after {
      right: calc(100% - 1px - 0.7em);
      top: -0.4em;
      width: 0.1em;
      height: 1em;
    }
  }
  div {
    ${props => transitions(['border'], props.theme.global.transitionDuration)};
    top: 0;
    color: ${(props: any) => props.theme.colors.white};
    position: absolute;
    width: 1.5em;
    height: 1em;
    border-radius: 0.1em;
    border: solid 0.01em transparent;
  }
  div::before {
    ${props => transitions(['color', 'left', 'top', 'width', 'height'], props.theme.global.transitionDuration)};
    content: '';
    position: absolute;
    left: 0em;
    top: 0em;
    width: 0;
    height: 0;
    background-color: ${(props: any) => props.theme.colors.white};
    transform-origin: bottom;
    transform: rotate(-54deg);
  }
  div::after {
    ${props => transitions(['color', 'right', 'top', 'width', 'height'], props.theme.global.transitionDuration)};
    content: '';
    position: absolute;
    right: 0em;
    top: 0em;
    width: 0;
    height: 0;
    background-color: ${(props: any) => props.theme.colors.white};
    transform-origin: bottom;
    transform: rotate(54deg);
  }
`;

const BlogLink = styled(Link)``;

const BlogIcon = styled.div`
  font-size: 10px;
  position: relative;
  width: 1.5em;
  box-sizing: content-box;
  display: inline-block;
  transition: border-color 1s;
  ${BlogLink}:hover & {
    div {
      border-color: currentColor;
      &:before {
        border-right: solid 0.5em currentColor;
      }
    }
  }
  div {
    ${props => transitions(['border-color'], props.theme.global.transitionDuration)};
    transition: border-color 1s;
    top: -0.75em;
    left: -0.75em;
    color: black;
    position: relative;
    margin-left: 0.4em;
    margin-top: 0.7em;
    width: 1.4em;
    height: 0.2em;
    border-radius: 0.1em;
    border: solid 0.1em transparent;
    transform: rotate(-45deg);
  }
  div:before {
    ${props => transitions(['border-right'], props.theme.global.transitionDuration)};
    content: '';
    position: absolute;
    left: -1.2em;
    top: -0.1em;
    width: 0;
    height: 0;
    border-left: solid 0.5em transparent;
    border-right: solid 0.7em transparent;
    border-top: solid 0.2em transparent;
    border-bottom: solid 0.2em transparent;
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
              <Heading level={1} underline={false}>
                Hi. I am <br />
                <Anchor as={Link} color="inherit" to="/contact">
                  <IconHover interactive size="inherit" underline signature underlineColor="color-secondary-1-0">
                    <ContactIcon>
                      <div />
                    </ContactIcon>
                    Jannes
                  </IconHover>
                </Anchor>
              </Heading>
              <Paragraph alignSelf="stretch" margin={{ bottom: '2rem' }}>
                I'm techy, Web developer, Architect, Consultant, Team Lead, UX (CX) advocate, visionary, renegade and optimist.
                <br />
                Let's{' '}
                <StyledAnchor as={Link} to="/meet" color="inherit">
                  <Text interactive as="span" size="inherit" underline underlineColor="color-secondary-1-0">
                    <IconPin>
                      <i />
                    </IconPin>
                    meet
                  </Text>
                </StyledAnchor>{' '}
                and see the awesome things we can do together!
              </Paragraph>
              <Grid
                columns={{
                  count: 3,
                  size: 'auto',
                }}
                gap="small"
              >
                <Button
                  // icon={<ContactInfo />}
                  href="/contact"
                  as={Link}
                  to="/contact"
                  label={'Contact'}
                />
                <Button
                  // icon={<Apps />}
                  href="/showcase"
                  as={Link}
                  to="/showcase"
                  label={'Showcase'}
                />
                <Button
                  // icon={<BlockQuote />}
                  href="/blog"
                  as={Link}
                  to="/blog"
                  label={'Blog'}
                />
              </Grid>
            </HomepageContent>
          </GridRow>
          <GridRow>
            <HomepageContent>
              <AboutMe />
              <Heading level={2}>Latest Blog</Heading>
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
              <Paragraph textAlign="end">
                <BlogLink to={'/blog'}>
                  <BlogIcon>
                    <div />
                  </BlogIcon>
                  All articles ({totalCount})
                </BlogLink>
              </Paragraph>
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
