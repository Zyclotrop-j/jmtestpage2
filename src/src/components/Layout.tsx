import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { normalize, transitions, fontFace } from 'polished';
import { Transition, animated as Animated } from 'react-spring/renderprops';
import { Grommet } from 'grommet';
import theme from '../../config/Theme';
import { media } from '../utils/media';
import split from 'lodash/split';
import './layout.scss';

const NormalizedStyle = createGlobalStyle`${normalize()}`;
const GlobalStyle = createGlobalStyle`
  ::selection {
    color: ${theme.colors.bg};
    background: ${theme.colors.primary};
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
    color: ${theme.colors.grey.dark};
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

const myTheme = {
  ...theme,
  global: {
    colors: {
      // active
      // focus
      brand: theme.colors['color-secondary-1-0'],
      'accent-1': theme.colors['color-primary-1'],
      'accent-2': theme.colors['color-secondary-1-1'],
      'accent-3': theme.colors['color-secondary-2-1'],
      'accent-4': theme.colors['color-primary-0'],
      'neutral-1': theme.colors['color-primary-4'],
      'neutral-2': theme.colors['color-secondary-1-4'],
      'neutral-3': theme.colors['color-secondary-2-4'],
      'neutral-4': theme.colors['color-primary-3'],
      // "status-critical"
      // "status-error"
      // "status-warning"
      // "status-ok"
      // "status-unknown"
      // "status-disabled"
      // white
    },
    font: {
      family: 'Sintony, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      face: () =>
        `${fontFace({
          fontFamily: 'Cantata One',
          fontFilePath: '../../fonts/CantataOne-Regular',
        })}
        ${fontFace({
          fontFamily: 'Sintony',
          fontFilePath: '../../fonts/Sintony-Regular',
        })}
        ${fontFace({
          fontFamily: 'HeadlandOne',
          fontFilePath: '../../fonts/HeadlandOne-Regular',
        })}`,
    },
    transitionDuration: '0.3s',
  },
  heading: {
    font: {
      family: "HeadlandOne, Georgia, 'Times New Roman', Times, serif",
    },
    extend: props => `
      ${
        props.underline === false
          ? ''
          : `
        display: inline-block;
        ::after {
            content: '';
            border-bottom: 2.5px solid ${props.theme.colors['color-primary-0']};
            width: calc( 100% + 10px);
            left: -5px;
            position: relative;
            display: block;
            transform: translateY(-3px) skewY(-0.5deg);
            -webkit-backface-visibility: hidden;
            -webkit-background-clip: content-box;
            -webkit-transform-style: preserve-3d;
        }
        ${
          props.signature
            ? `::after {
            border-bottom: 3.75px solid ${props.theme.colors['color-primary-0']};
            width: calc( 100% - 10px );
            left: 8px;
            border-radius: 1rem;
        }`
            : ''
        }
        ${
          props.thin
            ? `::after {
            border-bottom: 0.5px solid ${props.theme.colors['color-secondary-1-0']};
            width: calc( 100% + 3px);
            left: -1px;
            transform: translateY(-2px) skewY(-0.3deg);
        }`
            : ''
        }
        ${
          props.underlineColor
            ? `::after {
          border-bottom-color: ${props.theme.colors[props.underlineColor] ||
            props.theme.global.colors[props.underlineColor] ||
            props.underlineColor};
        }`
            : ''
        }`
      }
      `,
  },
  paragraph: {
    textAlign: 'justify',
  },
  text: {
    extend: props => `
      ${
        props.underline
          ? `
        display: inline-block;
        ${props.signature ? 'font-family: "Cantata One", "Helvetica Neue", Arial, sans-serif;' : ''}
        ${
          props.interactive
            ? `
          ::after {
            ${Object.entries(transitions(['width', 'left'], props.theme.global.transitionDuration)).reduce(
              (p, [k, v]) => `${p}
            ${k}: ${v};`,
              '',
            )};
          }
          &:hover::after {
            width: calc( 100% );
            left: 0px;
            ${props.signature ? 'width: calc( 100% + 5px ); left: -2px;' : ''}
            ${props.thin ? 'width: calc( 100% + 13px ); left: -6px;' : ''}
          }
        `
            : ''
        }
        ::after {
            content: '';
            border-bottom: 2.5px solid ${props.theme.colors['color-primary-0']};
            width: calc( 100% + 10px);
            left: -5px;
            position: relative;
            display: block;
            transform: translateY(-3px) skewY(-0.5deg);
            -webkit-backface-visibility: hidden;
            -webkit-background-clip: content-box;
            -webkit-transform-style: preserve-3d;
        }
        ${
          props.signature
            ? `::after {
            border-bottom: 3.75px solid ${props.theme.colors['color-primary-0']};
            width: calc( 100% - 10px );
            left: 8px;
            border-radius: 1rem;
        }`
            : ''
        }
        ${
          props.thin
            ? `::after {
            border-bottom: 0.5px solid ${props.theme.colors['color-secondary-1-0']};
            width: calc( 100% + 3px);
            left: -1px;
            transform: translateY(-2px) skewY(-0.3deg);
        }`
            : ''
        }
        ${
          props.underlineColor
            ? `::after {
          border-bottom-color: ${props.theme.colors[props.underlineColor] ||
            props.theme.global.colors[props.underlineColor] ||
            props.underlineColor};
        }`
            : ''
        }
      `
          : ''
      }
    `,
  },
  button: {
    border: {
      radius: '10px',
    },
  },
};

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

    return (
      <>
        <Header>
          "{prevPage}" - "{currentPage}"
        </Header>
        <Transition
          items={children}
          keys={item => item.key}
          from={{ ...(setAnimation.from || animations.faded), position: 'relative', left: 0 }}
          enter={{ ...(setAnimation.enter || animations.neutral), left: 0, position: 'relative' }}
          leave={{ ...(setAnimation.leave || animations.faded), position: 'absolute', left: 0 }}
        >
          {ichildren => props => <Animated.div style={props}>{ichildren}</Animated.div>}
        </Transition>
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
      </>
    );
  }
}
