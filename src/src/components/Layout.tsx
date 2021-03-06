import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { complement, darken, normalize } from 'polished';
import posed, { PoseGroup } from 'react-pose';
import { path, map, mergeDeepWithKey, concat, isNil, memoizeWith, filter, pipe, T, identity, equals, tryCatch } from "ramda";
import { Grommet, Box, SkipLinkTarget, defaultProps } from 'grommet';
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
import Link from 'gatsby-link';
import defer from "lodash/defer";
import { ToastContainer, toast } from 'react-toastify';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ModernLayout } from '../layouts/modern';
import { PageContext } from '../utils/PageContext';
import { MenuContext } from '../utils/menuContext';
import { NavigationEmitter } from '../utils/NavigationEmitter';

const StyledGrommet = styled(Grommet)`
  overflow: hidden;
`;
const HeadOverlay = styled.div``;
const PageWrap = styled.div`
  max-height: 100vh;
  overflow-y: auto;
`;

const MenuStyled = createGlobalStyle`
  .bm-burger-button {
    position: fixed;
    width: 36px;
    height: 30px;
    left: 36px;
    top: 36px;
  }
  .bm-burger-bars {
    background: ${props => props?.theme?.menu?.background ? normalizeColor(props?.theme?.menu?.background, props.theme): "#bdc3c7"};
    transform: scale(1, 1);
    transition: transform 1s, background 1s;
  }
  .bm-burger-bars-hover {
    background: ${props => props?.theme?.menu?.background ? darken(0.2, normalizeColor(props?.theme?.menu?.background, props.theme)) : darken(0.2, "#bdc3c7")};
    transform: scale(1.2, 1.2);
  }
  .bm-cross-button {
    height: 28px;
    width: 28px;
  }
  .bm-cross {
    background: ${props => props?.theme?.menu?.background ? complement(normalizeColor(props?.theme?.menu?.background, props.theme)): "#bdc3c7"};
  }
  .bm-menu-wrap {
    position: fixed;
    max-width: 100vw;
    min-width: 20vw;
    overflow: auto;
    height: auto;
    max-height: 100%;
    min-height: 100%;
    -webkit-overflow-scrolling: touch;
  }
  .bm-menu {
    height: auto !important;
    box-sizing: border-box;
    min-height: 100%;
    ${props => props?.theme?.menu?.background && colorStyle('background-color', props?.theme?.menu?.background, props.theme) || "background: #373a47;"}
  }
  .bm-item-list {
    box-sizing: border-box;
    padding: 0.8em;
  }
  .bm-item {
    display: inline-block;
  }
  .bm-overlay {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const NormalizedStyle = createGlobalStyle`${normalize()}`;
const GlobalStyle = createGlobalStyle`
  :root{
   --scrollbar-width: calc(100vw - 100%);
   --ratio: 1.5;
    --s-5: calc(var(--s-4) / var(--ratio));
    --s-4: calc(var(--s-3) / var(--ratio));
    --s-3: calc(var(--s-2) / var(--ratio));
    --s-2: calc(var(--s-1) / var(--ratio));
    --s-1: calc(var(--s0) / var(--ratio));
    --s0: 1rem;
    --s1: calc(var(--s0) * var(--ratio));
    --s2: calc(var(--s1) * var(--ratio));
    --s3: calc(var(--s2) * var(--ratio));
    --s4: calc(var(--s3) * var(--ratio));
    --s5: calc(var(--s4) * var(--ratio));
  }

  @supports (filter: invert(100%)) {
    @media only screen and (prefers-color-scheme: dark) {
      html { filter: invert(100%); }
      img:not([src*=".svg"]), video { filter: invert(100%) }
    }
  }

  @media only screen and (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
    }
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
  b, strong {
    font-weight: bold;
  }
  .leaflet-div-icon {
    background: transparent !important;
    border: 1px none transparent !important;
  }
  .Toastify__toast {
    background-color: var(--light-1);
    color: #333;
    &.Toastify__toast--info {
      background-color: var(--light-2);
      color: #333;
    }
    &.Toastify__toast--error {
      background-color: var(--status-error);
    }
    &.Toastify__toast--warning  {
      background-color: var(--status-warning);
    }
    &.Toastify__toast--success {
      background-color: var(--status-ok);
    }
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

const FixedBottomMenu = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
`;
const FlexBottomMenu = styled.footer`
  display: block;
`;
const FlexTopMenu = styled.header`
  display: block;
`;

const NoOverflowdiv = styled.div`
  overflow-x: hidden;
`;
const RouteContainer = posed(NoOverflowdiv)({
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

const Sidebarstatefull = ({
  component: Component,
  children,
  ...props
}) => {
  const [menuOpen, xsetMenuOpen] = React.useState(false);
  const setMenuOpen = toState => {
    if(menuOpen !== toState) {
      // Give the other operations enough time to complete
      return window.setTimeout(() => xsetMenuOpen(toState), 200);
    }
    console.warn(`Trying to change menu state from ${menuOpen} to ${toState} - this function should only be called if state is different!`)
    return null;
  };
  const closemenu = () => defer(xsetMenuOpen, false);
  React.useEffect(() => {
    NavigationEmitter.addEventListener("NAVIGATION-END", closemenu);
    return () => {
      NavigationEmitter.removeEventListener("NAVIGATION-END", closemenu);
    };
  }, [true]);


  return (<Component
    {...props}
    isOpen={menuOpen}
    onStateChange={state => defer(xsetMenuOpen, state.isOpen)}
  >
    <MenuContext.Provider value={{ setMenuOpen }}>
      {children}
    </MenuContext.Provider>
  </Component>);
}

const persitentConext = {};
export class Layout extends React.Component<{}> {
;

  public static getDerivedStateFromProps(props, state) {
    return { currentPage: props.location.pathname, prevPage: state && state.currentPage };
  }

  private static getContextValue(obj) {
    // Prevent re-renders
    return Object.entries(obj || {}).reduce((p, [k, v]) => {
      p[k] = v;
      return p;
    }, persitentConext);
  }
  public state = {}

  constructor(props) {
    super(props);
    const render = this.renderSubtree.bind(this);
    this.renderSubtree = memoizeWith(identity, render);
  }

  public componentDidMount() {
    import("../Widget").then(({ default: components }) => this.setState({
      components
    }));
  }
  public shouldComponentUpdate(nextProps, nextState) {
    if(this.props.location.pathname !== window.location.pathname) {
      NavigationEmitter.dispatchEvent({
        type: "NAVIGATION-START"
      });
    }
    if(nextState.components && !this.state.components) {
      return true;
    }
    return this.props.location.pathname !== window.location.pathname;
  }

  public render() {
    const {
      children,
      location: { pathname, state },
      pageContext
    } = this.props;
    const topmenu = pageContext?.tree?.topmenu;
    const bottommenu = pageContext?.tree?.bottommenu;
    const sidemenu = pageContext?.tree?.sidemenu;

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
      '16k': 15360,

      small: 768,
      medium: 1536,
      large: 1537
    };
    const bpPipeline = pipe(map(i => i?.value), filter(i => !!i), bp => Object.entries(bp).reduce((p, [k,v], idx, arr) => ({
      ...p,
      [`${k}small`]: arr[idx - 1] ? (v - arr[idx - 1][1]) / 3 * 2 + arr[idx - 1][1] : v / 2,
      [`${k}medium`]: v,
      [`${k}large`]: arr[idx + 1] ? (arr[idx + 1][1] - v) / 3  + v : v * 2,
    }), {
      ...addBP,
      ...bp
    }), (bp) => ({ bp }), memoizeWith(T, MqInit));

    // orientation: landscape portrait
    const mergeTheme = mergeDeepWithKey((k, l, r) => {
      if(isNil(r)) return l;
      if(isNil(l)) return r;
      if(k === '_id') return Array.isArray(l) ? l.concat([r]) : [l, r];
      return ['extend'].includes(k) ? concat(l, r) : r;
    });

    const baseTheme = mergeTheme(defaultProps.theme, {
      box: {
        extend: `
          outline: 0.125rem solid transparent;
          outline-offset: -0.125rem;
        `
      }
    });
    const mergeThemes = tryCatch(themes => themes.reduce((p, i) => mergeTheme(p, i), baseTheme), (e, i) => {
      console.error(e);
      return i && i[0];
    });

    const allthemes = mergeThemes(themes);

    const sidebars = {
      SlideMenu, StackMenu, PushMenu, PushRotateMenu, ScaleDownMenu, ScaleRotateMenu, FallDownMenu, RevealMenu
    };

    const sidemenutype = this.props.pageContext?.menudata?.data?.data?.website?.sidemenu?.type;
    const hasSideMenu = sidemenutype && sidemenutype.trim() && sidemenutype.trim() !== "none";
    const Sidebar = hasSideMenu ? sidebars[sidemenutype] : null;
    if(Sidebar === undefined) {
      console.error(`Sidebar has unknown type ${sidemenutype}`);
    }
    // flex static none
    const bottomtype = this.props.pageContext?.menudata?.data?.data?.website?.bottommenu?.type;
    const hasBottommenu = bottomtype && bottomtype.trim() && bottomtype.trim() !== "none";
    const topmenutype = this.props.pageContext?.menudata?.data?.data?.website?.topmenu?.type;
    const hasTopmenu = topmenutype && topmenutype.trim() && topmenutype.trim() !== "none";

    const topMenus = {
      flex: FlexTopMenu,
      static: Headroom, // // TODO: replace with real static and correct docs
      smart: Headroom
    };
    const TopMenu = hasTopmenu ? topMenus[topmenutype] : null;
    if(TopMenu === undefined) {
      console.error(`topMenus has unknown type ${topmenutype}`);
    }

    const bottomMenus = {
      flex: FlexBottomMenu,
      static: FixedBottomMenu
    };
    const BottomMenu = hasBottommenu ? bottomMenus[bottomtype] : null;
    if(BottomMenu === undefined) {
      console.error(`Bottommenu has unknown type ${bottomtype}`);
    }

    // var hasHorizontalScrollbar = div.scrollWidth > div.clientWidth;
    // var hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
    const componentsx = this.props?.data?.data;
    const __renderSubtree = this.renderSubtree(componentsx);
    const initialMobileBreakpoint =
      (typeof window !== 'undefined' && window.navigator) ?
      window.navigator.userAgent :
      "Mobile"; // Mobile first

    return (
        <MenuContext.Provider value={{ setMenuOpen: () => null }}><StyledGrommet
          cssVars
          full
          userAgent={initialMobileBreakpoint}
          theme={{
            ...allthemes,
            mq: bpPipeline(allthemes.global.breakpoints),
            __breakpoints: {
              ...allthemes.global.breakpoints,
              ...addBP,
            }
          }}
          id="outer-container"
        >
          <ErrorBoundary name="toastcontainer">
            <ToastContainer />
          </ErrorBoundary>
          <ErrorBoundary name="sidebar">
            {hasSideMenu ? <PageContext.Provider value={Layout.getContextValue({
              pages: this.props?.data?.data?.pages,
              pathname,
              theme: allthemes,
              mode: "vertical"
            })}>
              <>
                <MenuStyled />
                <Sidebarstatefull
                  component={Sidebar}
                  pageWrapId="page-wrap"
                  outerContainerId="outer-container"
                >
                  <SkipLinkTarget id="navigation_side" />
                  <Box direction="column" id="navigation_side_marker">
                    {__renderSubtree(sidemenu)}
                  </Box>
                </Sidebarstatefull>
              </>
            </PageContext.Provider> : <span />}
          </ErrorBoundary>
          <ErrorBoundary name="body">
            <PageContext.Provider value={Layout.getContextValue({
              pages: this.props?.data?.data?.pages,
              pathname,
              theme: allthemes,
              mode: "inline"
            })}>
              <PageWrap id="page-wrap" className="page-wrap">
                <ErrorBoundary name="topmenu">
                  {hasTopmenu ? <PageContext.Provider value={Layout.getContextValue({
                    pages: this.props?.data?.data?.pages,
                    pathname,
                    theme: allthemes,
                    mode: "horizontal"
                  })}>
                    <TopMenu>
                      <HeadOverlay>
                        <SkipLinkTarget id="navigation_top" />
                        <Box direction="row" id="navigation_top_marker">
                          {__renderSubtree(topmenu)}
                        </Box>
                      </HeadOverlay>
                    </TopMenu>
                  </PageContext.Provider> : <span />}
                </ErrorBoundary>
                <PoseGroup
                  preEnterPose={`${enterpose}enter`}
                  enterPose="default"
                  exitPose={`${exitpose}exit`}
                  onRest={() => NavigationEmitter.dispatchEvent({
                    type: "NAVIGATION-END"
                  })}
                >
                  <RouteContainer key={pathname}>
                    {children}
                  </RouteContainer>
                </PoseGroup>
                <ErrorBoundary name="bottommenu">
                  {hasBottommenu ? <PageContext.Provider value={Layout.getContextValue({
                    pages: this.props?.data?.data?.pages,
                    pathname,
                    theme: allthemes,
                    mode: "horizontal"
                  })}>
                    <BottomMenu>
                      <SkipLinkTarget id="navigation_bottom" />
                      <Box direction="row" id="navigation_bottom_marker">
                        {bottommenu && __renderSubtree(bottommenu)}
                      </Box>
                    </BottomMenu>
                  </PageContext.Provider> : <span />}
                </ErrorBoundary>
              </PageWrap>
            </PageContext.Provider>
          </ErrorBoundary>
        </StyledGrommet></MenuContext.Provider>
    );
  }

  private renderSubtree(components) {
    const render = (compo, addProps = {}) => {


      if (!compo) return null;
      if(!this.state.components) return null;
      if (Array.isArray(compo)) {
        return compo.map(i => render(i, addProps));
      }
      const { type, id, ...content } = compo;
      const gcomponents = this.state.components;
      const availableComponents = Object.entries(gcomponents).reduce((p, [k, v]) => ({
        ...p,
        [`DATA_Component${k.toLowerCase()}`]: v,
      }), {});


      const Component = availableComponents[type];
      if (!Component) {
        throw new Error(`[Layout] Couldn't find type ${type}, available are ${Object.keys(availableComponents).join(', ')}`);
      }
      const typename = `${type.substring(5).toLowerCase()}s`;
      const comp = components[typename];
      if (!comp) {
        throw new Error(`[Layout] Couldn't find comp ${typename}, available are ${Object.keys(components).join(', ')}`);
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
