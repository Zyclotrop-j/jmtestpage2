import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { normalize, transitions, fontFace } from 'polished';
import { Transition, animated as Animated } from 'react-spring/renderprops';
import { Grommet } from 'grommet';
import theme from '../../config/Theme';
import { myTheme } from '../utils/themeCreator';
import { media } from '../utils/media';
import split from 'lodash/split';

const NormalizedStyle = createGlobalStyle`${normalize()}`;
const GlobalStyle = createGlobalStyle`
  ::selection {
    color: ${theme.colors.bg};
    background: ${theme.colors.primary};
  }
  :root{
   --scrollbar-width: calc(100vw - 100%);
  }
  html {
    height: 100%;
  }
  body {
    height: inherit;
    overflow-x: hidden;
  }
  body {
    background: ${theme.colors.bg};
    color: ${theme.colors.grey.default};
    @media ${media.phone} {
      font-size: 14px;
    }
  }
  blockquote {
    font-style: italic;
    position: relative;
  }

  blockquote:before {
    content: "";
    position: absolute;
    background: ${theme.colors.primary};
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

    // Use https://www.gatsbyjs.org/packages/gatsby-plugin-layout/
    return (
      <>
        <NormalizedStyle />
        <GlobalStyle />
        <Grommet theme={myTheme}>
          <>{children}</>
        </Grommet>
      </>
    );
  }
}

export class Layout extends React.Component<{}> {
  public static getDerivedStateFromProps(props, state) {
    return { currentPage: props.location.pathname, prevPage: state && state.currentPage };
  }
  public shouldComponentUpdate() {
    return this.props.location.pathname !== window.location.pathname;
  }

  public render() {
    const {
      children,
      location: { pathname, state },
    } = this.props;
    const direction = state && state.direction; // ToDo: Enable defaults, enable ".?"-operator
    const { prevPage, currentPage } = this.state;
    const h = theme.header.height;
    const animations = {
      left: { transform: 'translate3d(-100vw, 0, 0)' },
      right: { transform: 'translate3d(100vw, 0, 0)' },
      neutral: { transform: 'translate3d(0vw, 0, 0)', opacity: 1 },
      faded: { opacity: 0 },
    };
    const presets = {
      right: {
        from: animations.right,
        leave: animations.left,
      },
      left: {
        from: animations.left,
        leave: animations.right,
      },
    };
    const setAnimation = (direction && presets[direction]) || !prevPage ? { from: animations.neutral } : {};
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
      <>
        <Transition
          items={children}
          keys={item => item.key}
          from={{ ...(setAnimation.from || animations.faded), position: 'relative', left: 0 }}
          enter={{ ...(setAnimation.enter || animations.neutral), left: 0, position: 'relative' }}
          leave={{ ...(setAnimation.leave || animations.faded), position: 'absolute', left: 0 }}
        >
          {ichildren => props => <Animated.div style={props}>{ichildren}</Animated.div>}
        </Transition>
      </>
    );
  }
}
