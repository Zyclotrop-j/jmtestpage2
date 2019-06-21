import React from 'react';
import Link from 'gatsby-link';
import { graphql } from 'gatsby';
import Helmet from 'react-helmet';
import { Anchor, Box, Grid, ResponsiveContext, SkipLinks, SkipLink, SkipLinkTarget } from 'grommet';
import { memoizeWith , identity } from "ramda";
import Img from 'gatsby-image'; // Imports the fragments as well!
import config from '../../config/SiteConfig';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ModernLayout } from '../layouts/modern';
// import components from '../Widget';

import { Headline } from '../Widget/Headline';
import { RichText } from '../Widget/RichText';
import { Text as JText } from '../Widget/Text';
import { Group as JGroup } from '../Widget/Group';
import { Grid as JGrid } from '../Widget/Grid';
import { Box as JBox } from '../Widget/Box';
import { Picture } from '../Widget/Picture';
import { Stage } from '../Widget/Stage';
import { Icon } from '../Widget/Icon';
import { CallToAction } from '../Widget/CallToAction';
import { Cards } from '../Widget/Cards';


const components = {
  RichText,
  Headline,
  Text: JText,
  Group: JGroup,
  Grid: JGrid,
  Box: JBox,
  Picture,
  Stage,
  Icon,
  CallToAction,
  Cards
};

const availableComponents = Object.entries(components).reduce((p, [k, v]) => ({
  ...p,
  [`DATA_Component${k.toLowerCase()}`]: v,
}), {});

export default class Page extends React.PureComponent {

  constructor(props) {
    super(props);
    const render = this.renderSubtree.bind(this);
    this.renderSubtree = memoizeWith(identity, render);
  }

  public render() {
    // pathContext
    const {
      pages,
      tree: { main, header = {}, footer = {} },
    } = this.props.pageContext;
    console.log("this.props.data", this.props.data.data);
    const {
      page: { path, lang, tabname, title, dir, description, keywords, otherLangs, firstPage, lastPage, nextPage, prevPage },
      ...componentsx
    } = this.props.data.data;
    // ltr, rtl, auto

    return (
      <>
        <Helmet>
          {(lang || dir) && <html lang={lang} dir={dir} />}
          <title>{tabname}</title>
          <meta name="title" content={tabname} />
          {keywords && <meta name="keywords" content={keywords.join(',')} />}
          {description && <meta name="description" content={description} />}
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
        {typeof document !== 'undefined' && <SkipLinks>
          <SkipLink id="header" label="Header" />
          <SkipLink id="main" label="Main content" />
          <SkipLink id="footer" label="Footer" />
        </SkipLinks>}
        <ModernLayout main={main} header={header} footer={footer} __renderSubtree={this.renderSubtree(componentsx)} />
      </>
    );
  }

  private renderSubtree(components) {
    const render = (compo, addProps = {}) => {
      if (!compo) return null;
      if (Array.isArray(compo)) {
        return compo.map(i => render(i, addProps));
      }
      const { type, id, ...content } = compo;
      const Component = availableComponents[type];
      if (!Component) {
        throw new Error(`Couldn't find type ${type}, available are ${Object.keys(availableComponents).join(', ')}`);
      }
      const typename = `${type.substring(5).toLowerCase()}s`;
      const comp = components[typename];
      if (!comp) {
        throw new Error(`Couldn't find comp ${typename}, available are ${Object.keys(components).join(', ')}`);
      }
      const props = comp.find(i => i._id === id);
      return (
        <ErrorBoundary key={props._id} id={props._id} title={props.title}>
          <Component {...props} {...addProps} __children={content} __renderSubtree={render} />
        </ErrorBoundary>
      );
    }
    return render;
  }
}


export const postQuery = graphql`
  fragment fcalltoaction on DATA_Componentcalltoaction {
    _id
    a11yTitle
    alignSelf
    color
    fill
    gap
    href
    icon
    label
    margin {
      bottom
      left
      right
      top
    }
    pageAction
    plain
    primary
    reverse
    richtext
  }
  fragment ficon on DATA_Componenticon {
    _id
    color
    icon
    size
    component
  }
  fragment fstage on DATA_Componentstage {
    _id
    defaultTiming
    slides {
      a11yTitle
      action {
        _id
        alignSelf
        animation
        color
        content
        delay
        fill
        href
        margin
        onClick
        primary
      }
      borderColor
      borderSide
      borderSize
      borderStyle
      bottom
      boxbackground
      headline {
        animation
        color
        content
        delay
        level
        margin
        size
        textAlign
      }
      height
      image {
        pingback
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
        author {
          name
          plattform
          plattformname
          portfolioUrl
          profileurl
          username
        }
        location {
          city
          country
        }
        tags
        alt
        color
        entry
        exit
        height
        width
      }
      left
      pad
      richtext {
        animation
        content
        content2
        content3
        content4
        content5
        content6
        content7
        content8
        delay
      }
      right
      text {
        alignSelf
        animation
        content
        delay
        size
        textAlign
      }
      timing
      top
    }
  }
  fragment ftext on DATA_Componenttext {
    _id
    b64
    urlescaped
    text
  }
  fragment fpicture on DATA_Componentpicture {
    _id
    alt
    pingback
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
  fragment fgrid on DATA_Componentgrid {
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
  fragment frichtext on DATA_Componentrichtext {
    _id
    markdown
    urlescaped
    escaped
    b64
  }
  fragment fbox on DATA_Componentbox {
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
      pingback
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
  fragment fheadline on DATA_Componentheadline {
    _id
    a11yTitle
    alignSelf
    color
    href
    level
    size
    textAlign
    truncate
    margin {
      top
      bottom
      left
      right
    }
    text
  }
  fragment fpage on DATA_Page {
    tabname
    path
    lang
    tabname
    title
    dir
    description
    keywords
    otherLangs
    firstPage {
      tabname
      path
      lang
      tabname
      title
      dir
      description
      keywords
      otherLangs
    }
    lastPage {
      tabname
      path
      lang
      tabname
      title
      dir
      description
      keywords
      otherLangs
    }
    nextPage {
      tabname
      path
      lang
      tabname
      title
      dir
      description
      keywords
      otherLangs
    }
    prevPage {
      tabname
      path
      lang
      tabname
      title
      dir
      description
      keywords
      otherLangs
    }
  }
  fragment fcards on DATA_Componentcards {
    _id
      leftColumn
      mode
      align
      cardlayout
      gridlayout
      imgtype
      justify
    	items {
        cta {
          ...fcalltoaction
        }
    	  ctaAlign
    	  ctaJustify
        disclaim {
          ...frichtext
        }
    	  disclaimAlign
    	  disclaimJustify
        heading {
          ...fheadline
        }
    	  headingAlign
    	  headingJustify
        icon {
         ...ficon
        }
    	  iconAlign
    	  iconJustify
    	  imgtype
    	  layout
        paragraph {
          ...frichtext
        }
        picture {
          ...fpicture
        }
    	  textAlign
    	  textJustify
    	}
  }

  query(
    $pageid: ID!
    $pageids: [ID!]
    $DATA_Componentgrid: [ID!]
    $DATA_Componenttext: [ID!]
    $DATA_Componentpicture: [ID!]
    $DATA_Componentrichtext: [ID!]
    $DATA_Componentbox: [ID!]
    $DATA_Componentheadline: [ID!]
    $DATA_Componentstage: [ID!]
    $DATA_Componenticon: [ID!]
    $DATA_Componentcalltoaction: [ID!]
    $DATA_Componentcards: [ID!]
  ) {
    data {
      componentcardss(_ids: $DATA_Componentcards) {
        ...fcards
      }
      componentcalltoactions(_ids: $DATA_Componentcalltoaction) {
        ...fcalltoaction
      }
      componenticons(_ids: $DATA_Componenticon) {
        ...ficon
      }
      pages(_ids: $pageids) {
        ...fpage
      }
      page(_id: $pageid) {
        ...fpage
      }
      componentstages(_ids: $DATA_Componentstage) {
        ...fstage
      }
      componenttexts(_ids: $DATA_Componenttext) {
        ...ftext
      }
      componentpictures(_ids: $DATA_Componentpicture) {
        ...fpicture
      }
      componentrichtexts(_ids: $DATA_Componentrichtext) {
        ...frichtext
      }
      componentgrids(_ids: $DATA_Componentgrid) {
        ...fgrid
      }
      componentboxs(_ids: $DATA_Componentbox) {
        ...fbox
      }
      componentheadlines(_ids: $DATA_Componentheadline) {
        ...fheadline
      }
    }
  }
`;
