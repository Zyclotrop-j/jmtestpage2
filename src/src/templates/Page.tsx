import React from 'react';
import Link from 'gatsby-link';
import { graphql } from 'gatsby';
import PageProps from '../models/PageProps';
import Helmet from 'react-helmet';
import { Anchor, Box, Grid, ResponsiveContext, SkipLinks, SkipLink, SkipLinkTarget } from 'grommet';
import config from '../../config/SiteConfig';
import { ErrorBoundary } from '../components/ErrorBoundary';
import kebabCase from 'lodash/kebabCase';
import Img from 'gatsby-image'; // Imports the fragments as well!
import { renameKeysWith } from 'ramda-adjunct';
import { ModernLayout } from "../layouts/modern";
import components from '../Widget';

const availableComponents = renameKeysWith(key => `DATA_Component${key.toLowerCase()}`, components);

export default class Page extends React.PureComponent<PageProps> {
  public render() {
    // pathContext

    const { pages, tree: { main, header = {}, footer = {} } } = this.props.pageContext;
    const { page: {
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
    }, ...components } = this.props.data.data;
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
        <ModernLayout {...props} __renderSubtree={this.renderSubtree.bind(this, components)} />
      </>
    );
  }

  private renderSubtree(components, compo, addProps = {}) {
    if(!compo) return null;
    if(Array.isArray(compo)) {
      return compo.map(i => this.renderSubtree(components, i, addProps));
    }
    const { type, id, ...content } = compo;
    const Component = availableComponents[type];
    const typename = `${type.substring(5).toLowerCase()}s`;
    const comp = components[typename];
    if (!comp) {
      throw new Error(`Couldn't find comp ${typename}, available are ${Object.keys(components).join(', ')}`);
    }
    const props = comp.find(i => i._id === id);
    if (!Component) {
      throw new Error(`Couldn't find type ${type}, available are ${Object.keys(availableComponents).join(', ')}`);
    }
    return (
      <ErrorBoundary key={props._id}>
        <Component {...props} {...addProps} __children={content} __renderSubtree={this.renderSubtree.bind(this, components)} />
      </ErrorBoundary>
    );
  }
}

export const postQuery = graphql`
  query($pageid: ID!, $DATA_Componentgrid: [ID!], $DATA_Componenttext: [ID!], $DATA_Componentpicture: [ID!], $DATA_Componentrichtext: [ID!], $DATA_Componentbox: [ID!], $DATA_Componentheadline: [ID!]) {
    data {
      page(_id: $pageid) {
        tabname
        path
        lang
        tabname
        title
        dir
        description
        keywords
        otherLangs
        firstPage
        lastPage
        nextPage
        prevPage
      }
      componenttexts(_ids: $DATA_Componenttext) {
        _id
        b64
        urlescaped
        text
      }
      componentpictures(_ids: $DATA_Componentpicture) {
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
              tracedSVG
              base64
              tracedSVG
              aspectRatio
              src
              srcSet
              srcWebp
              srcSetWebp
              originalName
              sizes
            }
          }
        }
      }
      componentrichtexts(_ids: $DATA_Componentrichtext) {
        _id
        markdown
        urlescaped
        escaped
        b64
      }
      componentgrids(_ids: $DATA_Componentgrid) {
        _id
        advanced {
          align
          alignContent
          alignSelf
          fill
          justify
          justifyContent
        }
        columns
        content {
          _id
        }
        gap
        margin {
          bottom
          left
          right
          top
        }
      }
      componentboxs(_ids: $DATA_Componentbox) {
        _id
        advanced {
          align
          alignContent
          alignSelf
          basis
          fill
          height
          justify
          responsive
          width
          flex {
            grow
            shrink
          }
          overflow {
            horizontal
            vertical
          }
        }
        direction
        elevation
        gap
        wrap
        animation {
          delay
          duration
          size
          type
        }
        background {
          color
          dark
          image
          opacity
          position
        }
        border {
          color
          side
          size
          style
        }
        content {
          _id
        }
        margin {
          bottom
          left
          right
          top
        }
        pad {
          bottom
          left
          right
          top
        }
        round {
          corner
          size
        }
      }
      componentheadlines(_ids: $DATA_Componentheadline) {
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
    }
  }
`;
