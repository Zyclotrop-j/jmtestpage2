import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { normalize, transitions, fontFace } from 'polished';
import posed, { PoseGroup } from 'react-pose';
import { mergeDeepWithKey, concat, isNil } from "ramda";
import { Grommet, defaultProps } from 'grommet';
import split from 'lodash/split';

const NormalizedStyle = createGlobalStyle`${normalize()}`;
const GlobalStyle = createGlobalStyle`
  :root{
   --scrollbar-width: calc(100vw - 100%);
  }
  html {
    height: 100%;
  }
  body {
    height: inherit;
    overflow-x: hidden;
    margin: 0;
  }
  blockquote {
    font-style: italic;
    position: relative;
  }

  blockquote:before {
    content: "";
    position: absolute;
    height: 100%;
    width: 6px;
    margin-left: -1.6rem;
  }
  label {
    margin-bottom: .5rem;
  }
  input, textarea {
    border-radius: .5rem;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    padding: .25rem 1rem;
    &:focus {
      outline: none;
    }
  }
  code,
  kbd,
  pre,
  samp {
    font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
  }
  b {
    font-weight: bold;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 3rem 0;
  span {
    font-size: 0.75rem;
  }
`;

const Header = styled.header`
  position: absolute;
  top: 0;
  height: ${props => props.theme.header.height};
`;

export class Provider extends React.PureComponent<{}> {
  public render() {
    const { children } = this.props;
    /*
    <NormalizedStyle />
    <GlobalStyle />
    <>{children}</>
    */
    return (
      <>
        <NormalizedStyle />
        <GlobalStyle />
        <>{children}</>
      </>
    );
  }
}

const mergeTheme = mergeDeepWithKey((k, l, r) => {
  if(isNil(r)) return l;
  if(isNil(l)) return r;
  if(k === '_id') return Array.isArray(l) ? l.concat([r]) : [l, r];
  return ['extend'].includes(k) ? concat(l, r) : r;
});
const mergeThemes = themes => themes.reduce((p, i) => mergeTheme(p, i), defaultProps.theme);

const RouteContainer = posed.div({
  default: { opacity: 1, x: 0, y:0 },

  leftexit: { opacity: 1, x: "-100%", y: 0 },
  rightexit: { opacity: 1, x: "100%", y: 0 },
  topexit: { opacity: 1, x: 0, y: "-100%" },
  bottomexit: { opacity: 1, x: 0, y: "100%" },
  fadedexit: { opacity: 0, x: 0, y:0 },

  leftenter: { opacity: 1, x: "-100%", y: 0, delay: 300, beforeChildren: true },
  rightenter: { opacity: 1, x: "100%", y: 0, delay: 300, beforeChildren: true },
  topenter: { opacity: 1, x: 0, y: "-100%", delay: 300, beforeChildren: true },
  bottomenter: { opacity: 1, x: 0, y: "100%", delay: 300, beforeChildren: true },
  fadedenter: { opacity: 0, x: 0, y:0, delay: 300, beforeChildren: true }
});

export class Layout extends React.Component<{}> {

  public state = {}

  public static getDerivedStateFromProps(props, state) {
    return { currentPage: props.location.pathname, prevPage: state && state.currentPage };
  }
  public shouldComponentUpdate() {
    return this.props.location.pathname !== window.location.pathname;
  }

  public render() {
    const {
      children,
      location: { pathname, state }
    } = this.props;

    const themes = this.props?.pageContext?.website?.themes || [];

    const direction = state?.direction;
    const { prevPage, currentPage } = this.state;

    const opposide = dir => ({
      left: "right",
      top: "bottom",
      right: "left",
      bottom: "top",
      faded: "faded"
    }[dir]);
    const enterpose = state?.in || direction || "faded";
    const exitpose = state?.out || opposide(direction) || "faded";
    /*
      <Header>
        "{prevPage}" - "{currentPage}"
      </Header>
      */
    /*
      <StaticQuery
        query={graphql`
          query LayoutQuery {
            site {
              buildTime(formatString: "DD.MM.YYYY")
            }
          }
        `}
        render={data => (
          <Footer>
            &copy; {split(data.site.buildTime, '.')[2]} by Jannes Mingram. All rights reserved. <br />
            <a href="https://github.com/mhadaily/gatsby-starter-typescirpt-power-blog">GitHub Repository</a> <br />
            <span>Last build: {data.site.buildTime}</span>
          </Footer>
        )}
      />
      */
    return (
      <Grommet theme={mergeThemes(themes)}>
        <PoseGroup
          preEnterPose={`${enterpose}enter`}
          enterPose="default"
          exitPose={`${exitpose}exit`}
        >
          <RouteContainer key={pathname}>
            {children}
          </RouteContainer>
        </PoseGroup>
      </Grommet>
    );
  }
}
