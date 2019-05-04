import React from 'react';
import Link from 'gatsby-link';
import { graphql } from 'gatsby';
import PageProps from '../models/PageProps';
import Helmet from 'react-helmet';
import { Anchor, Box, Grid, ResponsiveContext, SkipLinks, SkipLink, SkipLinkTarget } from 'grommet';
import { mq } from '../utils/media';
import config from '../../config/SiteConfig';
import { ErrorBoundary } from '../components/ErrorBoundary';
import kebabCase from 'lodash/kebabCase';
import styled from 'styled-components';
import Img from 'gatsby-image'; // Imports the fragments as well!
import { renameKeysWith } from 'ramda-adjunct';
import components from '../Widget';

const Main = styled.main`
  position: relative;
  padding: 0;
  ${mq('small')(`
   padding: 0 3rem;
  `)}
`;

const availableComponents = renameKeysWith(key => `DATA_Component${key.toLowerCase()}`, components);

export default class Page extends React.PureComponent<PageProps> {
  public render() {
    // pathContext
    const {
      path,
      lang,
      tabname,
      title,
      dir,
      description,
      keywords,
      otherLangs,
      firstPage,
      lastPage,
      nextPage,
      prevPage,
    } = this.props.pageContext.data;

    const { header, main, footer } = this.props.data.data.page;

    // ltr, rtl, auto
    return (
      <>
        <Helmet>
          {(lang || dir) && <html lang={lang} dir={dir} />}
          <title>{tabname}</title>
          <meta name="title" content={tabname} />
          {keywords && <meta name="keywords" content={keywords.join(',')} />}
          <meta name="canonical" content={path} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={path} /> {/* add domain? */}
          <meta name="twitter:title" content={title} />
          <meta name="twitter:url" content={path} />
          {otherLangs && otherLangs.map(i => <meta name="alternate" key={`${i.path}${i.lang}`} hreflang={i.lang} content={i.path} />)}
          {otherLangs && <meta property="og:locale:alternate" content={otherLangs.map(i => i.lang).join(',')} />}
          {prevPage && <meta name="prev" content={prevPage} />}
          {nextPage && <meta name="next" content={nextPage} />}
          {firstPage && <meta name="first" content={firstPage} />}
          {lastPage && <meta name="last" content={lastPage} />}
          {/* <link rel=”alternate” hreflang=”x-default” href=”https://www.mysite.com”/> */}
        </Helmet>
        <SkipLinks id="skip-links">
          <SkipLink id="header" label="Header" />
          <SkipLink id="main" label="Main content" />
          <SkipLink id="footer" label="Footer" />
        </SkipLinks>
        <Grid
          as="header"
          rows={['full']}
          columns={['auto', 'flex', 'auto']}
          areas={[
            { name: 'left', start: [0, 0], end: [1, 0] },
            { name: 'center', start: [1, 0], end: [2, 0] },
            { name: 'right', start: [2, 0], end: [3, 0] },
          ]}
        >
          <SkipLinkTarget id="header" />
          <Box gridArea="left" background="brand">
            {header.left && header.left.components.map(this.renderSubtree)}
          </Box>
          <Box gridArea="center" background="brand">
            {header.center && header.center.components.map(this.renderSubtree)}
          </Box>
          <Box gridArea="right" background="brand">
            {header.right && header.right.components.map(this.renderSubtree)}
          </Box>
        </Grid>
        <Main>
          <SkipLinkTarget id="main" />
          <Box direction="column">{main.components.map(this.renderSubtree)}</Box>
        </Main>
        <Grid
          as="footer"
          rows={['full']}
          columns={['auto', 'flex', 'auto']}
          areas={[
            { name: 'left', start: [0, 0], end: [1, 0] },
            { name: 'center', start: [1, 0], end: [2, 0] },
            { name: 'right', start: [2, 0], end: [3, 0] },
          ]}
        >
          <SkipLinkTarget id="footer" />
          <Box gridArea="left" background="brand">
            {footer.left && footer.left.components.map(this.renderSubtree)}
          </Box>
          <Box gridArea="center" background="brand">
            {footer.center && footer.center.components.map(this.renderSubtree)}
          </Box>
          <Box gridArea="right" background="brand">
            {footer.right && footer.right.components.map(this.renderSubtree)}
          </Box>
        </Grid>
      </>
    );
  }

  private renderSubtree({ __typename, ...sprops }) {
    const Component = availableComponents[__typename];
    if (!Component) {
      throw new Error(`Couldn't find type ${__typename}, available are ${Object.keys(availableComponents).join(', ')}`);
    }
    return (
      <ErrorBoundary key={sprops._id}>
        <Component {...sprops} />
      </ErrorBoundary>
    );
  }
}

export const postQuery = graphql`
  fragment components on DATA_Componentgroup {
    components {
      __typename
      ... on DATA_Componenttext {
        b64
        urlescaped
        text
      }
      ... on DATA_Componentheadline {
        _id
        a11yTitle
        alignSelf
        color
        href
        level
        size
        textAlign
        truncate
      }
      ... on DATA_Componentrichtext {
        _id
        markdown
        urlescaped
        escaped
        b64
      }
      ... on DATA_Componentpicture {
        _id
        alt
        author {
          name
          username
          profileurl
          portfolioUrl
        }
        color
        crossorigin
        description
        height
        width
        location {
          city
          country
        }
        src
        srcFile {
          relativePath
          childImageSharp {
            fluid(maxWidth: 2000) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    }
  }
  query($pageid: ID!) {
    data {
      page(_id: $pageid) {
        header {
          left {
            ...components
          }
          right {
            ...components
          }
          center {
            ...components
          }
        }
        footer {
          left {
            ...components
          }
          right {
            ...components
          }
          center {
            ...components
          }
        }
        main {
          ...components
        }
      }
    }
  }
`;

// Notes: worldMapplace -> place, tableheader -> header, tablefooter -> footer, tablebody -> body, tabsheader -> header
