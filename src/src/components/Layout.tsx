import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { complement, darken, normalize } from 'polished';
import posed, { PoseGroup } from 'react-pose';
import { path, map, mergeDeepWithKey, concat, isNil, memoizeWith, filter, pipe, T } from "ramda";
import { Grommet, defaultProps } from 'grommet';
import MqInit from 'styled-components-media-query';
import Headroom from "react-headroom";
import SlideMenu from 'react-burger-menu/lib/menus/slide';
import StackMenu from 'react-burger-menu/lib/menus/stack';
import PushMenu from 'react-burger-menu/lib/menus/push';
import PushRotateMenu from 'react-burger-menu/lib/menus/pushRotate';
import ScaleDownMenu from 'react-burger-menu/lib/menus/scaleDown';
import ScaleRotateMenu from 'react-burger-menu/lib/menus/scaleRotate';
import FallDownMenu from 'react-burger-menu/lib/menus/fallDown';
import RevealMenu from 'react-burger-menu/lib/menus/reveal';
import { colorStyle, normalizeColor } from 'grommet-styles';
import { Menu } from "../Widget/Menu";

const HeadOverlay = styled.div``;
const MenuStyled = createGlobalStyle`
  /* Position and sizing of burger button */
  .bm-burger-button {
    position: fixed;
    width: 36px;
    height: 30px;
    left: 36px;
    top: 36px;
  }
  /* Color/shape of burger icon bars */
  .bm-burger-bars {
    background: ${props => props?.theme?.menu?.background ? normalizeColor(props?.theme?.menu?.background, props.theme): "#bdc3c7"};
    transform: scale(1, 1);
    transition: transform 1s, background 1s;
  }
  /* Color/shape of burger icon bars on hover*/
  .bm-burger-bars-hover {
    background: ${props => props?.theme?.menu?.background ? darken(0.2, normalizeColor(props?.theme?.menu?.background, props.theme)) : darken(0.2, "#bdc3c7")};
    transform: scale(1.2, 1.2);
  }
  /* Position and sizing of clickable cross button */
  .bm-cross-button {
    height: 28px;
    width: 28px;
  }
  /* Color/shape of close button cross */
  .bm-cross {
    background: ${props => props?.theme?.menu?.background ? complement(normalizeColor(props?.theme?.menu?.background, props.theme)): "#bdc3c7"};
  }
  /*
  Sidebar wrapper styles
  Note: Beware of modifying this element as it can break the animations - you should not need to touch it in most cases
  */
  .bm-menu-wrap {
    position: fixed;
    height: 100%;
    max-width: 100vw;
    min-width: 20vw;
  }
  /* General sidebar styles */
  .bm-menu {
    ${props => props?.theme?.menu?.background && colorStyle('background-color', props?.theme?.menu?.background, props.theme) || "background: #373a47;"}
  }
  /* Wrapper for item list */
  .bm-item-list {
    box-sizing: border-box;
    padding: 0.8em;
  }
  /* Individual item */
  .bm-item {
    display: inline-block;
  }
  /* Styling of overlay */
  .bm-overlay {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const NormalizedStyle = createGlobalStyle`${normalize()}`;
const GlobalStyle = createGlobalStyle`
  :root{
   --scrollbar-width: calc(100vw - 100%);
  }
  html {
    height: 100%;
    [type="button"], [type="reset"], [type="submit"] {
      -webkit-appearance: unset;
    }
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

export class Provider extends React.PureComponent<{}> {
  public render() {
    const { children } = this.props;
    return (
      <>
        <NormalizedStyle />
        <GlobalStyle />
        <>{children}</>
      </>
    );
  }
}

const addBP = {
  xxxs: 200,
  xxs: 320,
  xs: 480,
  s: 800,
  sl: 960,
  m: 1024,
  ml: 1280,
  l: 1334,
  xl: 1366,
  xxl: 1600,
  xxxl: 1920,
  xxxxl: 2560,
  xxxxxl: 3840,
  'UltraHD1': 3840,
  '4k': 3840,
  xxxxxxl: 5120,
  '5k': 5120,
  'UXGA ': 6400,
  'HSXGA  ': 6400,
  '8k': 7680,
  'UltraHD2': 7680,
  '10k': 10240,
  '16k': 15360
};
const tap = x => {
  console.log("!!!!", x);
  return x;
}
const bpPipeline = pipe(map(i => i.value), filter(i => !!i), bp => Object.entries(bp).reduce((p, [k,v], idx, arr) => ({
  ...p,
  [`${k}small`]: arr[idx - 1] ? (v - arr[idx - 1][1]) / 3 * 2 + arr[idx - 1][1] : v / 2,
  [`${k}medium`]: v,
  [`${k}large`]: arr[idx + 1] ? (arr[idx + 1][1] - v) / 3  + v : v * 2,
}), {
  ...addBP,
  ...bp
}), tap, (bp) => ({ bp }), memoizeWith(T, MqInit));

// orientation: landscape portrait
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
    const allthemes = mergeThemes(themes);
    const sidebars = {
      SlideMenu, StackMenu, PushMenu, PushRotateMenu, ScaleDownMenu, ScaleRotateMenu, FallDownMenu, RevealMenu
    };

    const Sidebar = sidebars["PushMenu"];

    console.log("this.props this.props", this.props);

    return (
      <Grommet
        theme={{
          ...allthemes,
          mq: bpPipeline(allthemes.global.breakpoints),
        }}
        id={`${pathname}-outer-container`}
      >
        <MenuStyled />
        {/* // // TODO: Render dynamically with content */}
        <Sidebar pageWrapId={`${pathname}-page-wrap`} outerContainerId={`${pathname}-outer-container`}>
          <Menu mode="vertical" theme={allthemes} pathname={pathname} pages={this.props?.data?.data?.pages} />
        </Sidebar>
        <Headroom>
          {/* // // TODO: Render dynamically with content */}
          <HeadOverlay>
            <Menu mode="horizontal" theme={allthemes} pathname={pathname} pages={this.props?.data?.data?.pages} />
          </HeadOverlay>
        </Headroom>
        <PoseGroup
          preEnterPose={`${enterpose}enter`}
          enterPose="default"
          exitPose={`${exitpose}exit`}
        >
          <RouteContainer id={`${pathname}-page-wrap`} key={pathname}>
            {children}
          </RouteContainer>
        </PoseGroup>
      </Grommet>
    );
  }
}
