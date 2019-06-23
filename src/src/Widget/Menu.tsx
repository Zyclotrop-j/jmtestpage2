import React from 'react';
import { Link } from 'gatsby';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { path, map, filter, T, assocPath } from "ramda";
import { defaultProps, Anchor } from 'grommet';
import RCMenu, { SubMenu, MenuItem } from 'rc-menu';
import { normalizeColor } from 'grommet-styles';
import { complement, darken } from 'polished';
import { PageContext } from "../utils/PageContext";

const rcMenuOpenSlideUpIn = keyframes`
  0% {
    opacity: 0;
    transform-origin: 0% 0%;
    transform: scaleY(0);
  }
  100% {
    opacity: 1;
    transform-origin: 0% 0%;
    transform: scaleY(1);
  }
`;
const rcMenuOpenSlideUpOut = keyframes`
  0% {
    opacity: 1;
    transform-origin: 0% 0%;
    transform: scaleY(1);
  }
  100% {
    opacity: 0;
    transform-origin: 0% 0%;
    transform: scaleY(0);
  }
`;
const rcMenuOpenZoomIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0, 0);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1);
  }
`;
const rcMenuOpenZoomOut = keyframes`
  0% {
    transform: scale(1, 1);
  }
  100% {
    opacity: 0;
    transform: scale(0, 0);
  }
`;
const StyledMenu = styled(RCMenu)`
  margin-top: 0;
`;
const SyledMenuItem = styled(MenuItem)``;
const StyledSubMenu = styled(SubMenu)``;

const RCStyle = createGlobalStyle`
  .rc-menu {
    outline: none;
    margin-bottom: 0;
    padding-left: 0;
    list-style: none;
  }
  .rc-menu-hidden {
    display: none;
  }
  .rc-menu-collapse {
    overflow: hidden;
  }
  .rc-menu-collapse-active {
    transition: height 0.3s ease-out;
  }
  .rc-menu-item-group-list {
    margin: 0;
    padding: 0;
  }
  .rc-menu-item-selected {
    transform: translateZ(0);
  }
  .rc-menu > li.rc-menu-submenu {
    padding: 0;
  }
  .rc-menu-horizontal.rc-menu-sub,
  .rc-menu-vertical.rc-menu-sub,
  .rc-menu-vertical-left.rc-menu-sub,
  .rc-menu-vertical-right.rc-menu-sub {
    min-width: 160px;
    margin-top: 0;
  }
  .rc-menu-item,
  .rc-menu-submenu-title {
    margin: 0;
    position: relative;
    display: block;
    /* padding: 7px 7px 7px 16px; */
    white-space: nowrap;
  }
  /*
  .rc-menu-item.rc-menu-item-disabled,
  .rc-menu-submenu-title.rc-menu-item-disabled,
  .rc-menu-item.rc-menu-submenu-disabled,
  .rc-menu-submenu-title.rc-menu-submenu-disabled {
    color: #777 !important;
  }
  */
  .rc-menu > .rc-menu-item-divider {
    height: 1px;
    margin: 1px 0;
    overflow: hidden;
    padding: 0;
    line-height: 0;
    background: ${props => props?.theme?.menu?.background ? darken(0.5, normalizeColor(props?.theme?.menu?.background, props.theme)): darken(0.5, "#bdc3c7")};
  }
  .rc-menu-submenu-popup {
    position: absolute;
    z-index: 1200;
  }
  .rc-menu-submenu-popup .submenu-title-wrapper {
    padding-right: 20px;
  }
  .rc-menu-submenu > .rc-menu {
    background: ${props => props?.theme?.menu?.background ? normalizeColor(props?.theme?.menu?.background, props.theme): "#bdc3c7"};
  }
  .rc-menu .rc-menu-submenu-title .anticon,
  .rc-menu .rc-menu-item .anticon {
    width: 14px;
    height: 14px;
    margin-right: 8px;
    top: -1px;
  }
  .rc-menu-horizontal {
    box-shadow: none;
    white-space: nowrap;
    overflow: hidden;
    .rc-menu-item > a, .rc-menu-submenu > * > span {
      padding: 1rem;
      display: inline-block;
    }
  }
  .rc-menu-horizontal > .rc-menu-item,
  .rc-menu-horizontal > .rc-menu-submenu > .rc-menu-submenu-title {

  }
  .rc-menu-horizontal > .rc-menu-submenu,
  .rc-menu-horizontal > .rc-menu-item {
    border-bottom: 2px solid transparent;
    display: inline-block;
    vertical-align: bottom;
  }
  .rc-menu-horizontal > .rc-menu-submenu-active,
  .rc-menu-horizontal > .rc-menu-item-active {
    background: ${props => props?.theme?.menu?.background ? normalizeColor(props?.theme?.menu?.background, props.theme): "#bdc3c7"};
    color: ${props => props?.theme?.menu?.background ? complement(normalizeColor(props?.theme?.menu?.background, props.theme)): "#bdc3c7"};
  }
  .rc-menu-vertical,
  .rc-menu-vertical-left,
  .rc-menu-vertical-right,
  .rc-menu-inline {
    padding: 12px 0;
    margin: 0;
  }
  .rc-menu-vertical > .rc-menu-item,
  .rc-menu-vertical-left > .rc-menu-item,
  .rc-menu-vertical-right > .rc-menu-item,
  .rc-menu-inline > .rc-menu-item,
  .rc-menu-vertical > .rc-menu-submenu > .rc-menu-submenu-title,
  .rc-menu-vertical-left > .rc-menu-submenu > .rc-menu-submenu-title,
  .rc-menu-vertical-right > .rc-menu-submenu > .rc-menu-submenu-title,
  .rc-menu-inline > .rc-menu-submenu > .rc-menu-submenu-title {
    padding: 12px 8px 12px 24px;
  }
  .rc-menu-vertical .rc-menu-submenu-arrow,
  .rc-menu-vertical-left .rc-menu-submenu-arrow,
  .rc-menu-vertical-right .rc-menu-submenu-arrow,
  .rc-menu-inline .rc-menu-submenu-arrow {
    display: inline-block;
    font-size: inherit;
    vertical-align: baseline;
    text-align: center;
    text-transform: none;
    text-rendering: auto;
    position: absolute;
    right: 16px;
    line-height: 1.5em;
  }
  .rc-menu-inline .rc-menu-submenu-arrow {
    transform: rotate(90deg);
    transition: transform .3s;
  }
  .rc-menu-inline .rc-menu-submenu-open > .rc-menu-submenu-title .rc-menu-submenu-arrow {
    transform: rotate(-90deg);
  }
  .rc-menu-vertical.rc-menu-sub,
  .rc-menu-vertical-left.rc-menu-sub,
  .rc-menu-vertical-right.rc-menu-sub {
    padding: 0;
  }
  .rc-menu-sub.rc-menu-inline {
    padding: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
  .rc-menu-sub.rc-menu-inline > .rc-menu-item,
  .rc-menu-sub.rc-menu-inline > .rc-menu-submenu > .rc-menu-submenu-title {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-right: 0;
  }
  .rc-menu-open-slide-up-enter,
  .rc-menu-open-slide-up-appear {
    animation-duration: .3s;
    animation-fill-mode: both;
    transform-origin: 0 0;
    opacity: 0;
    animation-timing-function: cubic-bezier(0.08, 0.82, 0.17, 1);
    animation-play-state: paused;
  }
  .rc-menu-open-slide-up-leave {
    animation-duration: .3s;
    animation-fill-mode: both;
    transform-origin: 0 0;
    opacity: 1;
    animation-timing-function: cubic-bezier(0.6, 0.04, 0.98, 0.34);
    animation-play-state: paused;
  }

  .rc-menu-open-slide-up-enter.rc-menu-open-slide-up-enter-active,
  .rc-menu-open-slide-up-appear.rc-menu-open-slide-up-appear-active {
    animation-name: ${rcMenuOpenSlideUpIn};
    animation-play-state: running;
  }
  .rc-menu-open-slide-up-leave.rc-menu-open-slide-up-leave-active {
    animation-name: ${rcMenuOpenSlideUpOut};
    animation-play-state: running;
  }
  .rc-menu-open-zoom-enter,
  .rc-menu-open-zoom-appear {
    opacity: 0;
    animation-duration: .3s;
    animation-fill-mode: both;
    transform-origin: 0 0;
    animation-timing-function: cubic-bezier(0.08, 0.82, 0.17, 1);
    animation-play-state: paused;
  }
  .rc-menu-open-zoom-leave {
    animation-duration: .3s;
    animation-fill-mode: both;
    transform-origin: 0 0;
    animation-timing-function: cubic-bezier(0.6, 0.04, 0.98, 0.34);
    animation-play-state: paused;
  }
  .rc-menu-open-zoom-enter.rc-menu-open-zoom-enter-active,
  .rc-menu-open-zoom-appear.rc-menu-open-zoom-appear-active {
    animation-name: ${rcMenuOpenZoomIn};
    animation-play-state: running;
  }
  .rc-menu-open-zoom-leave.rc-menu-open-zoom-leave-active {
    animation-name: ${rcMenuOpenZoomOut};
    animation-play-state: running;
  }

  .rc-menu-horizontal:after {
    content: "\\20";
    display: block;
    height: 0;
    clear: both;
  }
  .rc-menu-vertical .rc-menu-submenu-arrow:before,
  .rc-menu-vertical-left .rc-menu-submenu-arrow:before,
  .rc-menu-vertical-right .rc-menu-submenu-arrow:before,
  .rc-menu-inline .rc-menu-submenu-arrow:before {
    content: "\\f0da";
  }
`;

const A = props => {
  const as = props.href[0] === "/" ? { as: Link, to: props.href } : {};
  return <Anchor {...props} {...as} href={props.href} />;
};

export const uiSchema = {};

const schema = {
  "title": "componentmenu",
  "type": "object",
  "properties": {
    "autoAddDepth": {
      "type": "number",
      "description": "Auto add entries from the pages of this site of up to this depth. Default 1. Put 0 to disable",
      "min": 0,
      "multipleOf": 1.0
    },
    "manualEntries": {
      "type": "array",
      "items": {
        "anyOf": [
          {
            "type": "string",
            "x-$ref": "page"
          },
          {
            "type": "string",
            "x-$ref": "componentcalltoaction"
          }
        ]
      }
    }
  }
};

export class Menu extends React.PureComponent<Props> {

  static defaultProps = {
    autoAddDepth: 1,
    menuentries: []
  }

  static contextType = PageContext;

  static VALUE = Symbol("___value");

  public render() {
    const {
      autoAddDepth,
      menuentries: imenuentries,
      _id,
      pages: pagesa,
      theme: themea,
      mode: modea,
      pathname: pathnamea
    } = this.props;

    const {
      pages: pagesb,
      pathname: pathnameb,
      theme: themeb,
      mode: modeb
    } = this.context;

    const pathname = pathnamea || pathnameb;
    const pages = pagesa || pagesb;
    const theme = themea || themeb;
    const mode = {
      verticalleft: "vertical-left", // well.... graphQL and names....
      verticalright: "vertical-right" // well.... graphQL and names....
    }[modea || modeb] || modea || modeb;

    const addEntries = isNaN(parseInt(autoAddDepth)) ? 1 : autoAddDepth;
    const menuentries = imenuentries.map(i => ({
      ...i,
      path: i.path || i.href
    }));

    const t = menuentries.reduce((p, i) => assocPath([...i.path.split("/").filter(j => j.trim()), Menu.VALUE],
        Object.assign(path([...i.path.split("/").filter(j => j.trim()), Menu.VALUE]) || {}, i),
      p),
      pages?.reduce((p, i, idx) => {
        const arrpath = i.path.split("/").filter(j => j.trim());
        if(!arrpath.length) return p; // Exclude '/'-path
         // don't include sides that start with _ - anywhere in the path
         // eg /_x or /_/foo
        if(arrpath.some(i => i.startsWith("_"))) return p;
        if(addEntries < arrpath.length) return p; // Auto-add items up to addEntries-depth
        return assocPath([...arrpath, Menu.VALUE], i, p);
      }, {})
    );
    const objToMenu = (obj, depth) => {
      return Object.values(obj || {}).sort((a, b) => {
        const av = a[Menu.VALUE];
        const bv = b[Menu.VALUE];
        if(!av && !bv) return 0;
        if(!av) return -1;
        if(!bv) return 1;
        const aidx = menuentries.findIndex(({ path, href }) => av.path === path || av.path === href);
        const bidx = menuentries.findIndex(({ path, href }) => bv.path === path || bv.path === href);
        if(aidx === -1 && bidx === -1) return 0;
        if(aidx === -1) return -1;
        if(bidx === -1) return 1;
        return aidx - bidx;
      }).map(q => {
        const link = q[Menu.VALUE];
        const children = objToMenu(q, depth + 1);
        if(!link) {
          if(!children.length) {
            return null;
          }
          return (<StyledSubMenu title={" "}>
            {children}
          </StyledSubMenu>);
        }
        const item = link.path && link.path.trim() ? <SyledMenuItem key={link.path}>
          <A {...link} icon={
            link.icon && link.icon.trim() && link.icon.trim() !== "none" ? link.icon : undefined
          } href={link.path} className={`${link.className || ""} menu-item--small`} title={
            link.label ? link.menutitle : link.menutitle ? link.tabname : link.title
          }>
            {link.label || link.menutitle || link.tabname || link.title}
          </A>
        </SyledMenuItem> : null;
        return children.length ? <StyledSubMenu title={link.tabname || link.title} key={link.path} >
          {item}
          {children}
        </StyledSubMenu> : item;
      });
    };

    return (<><RCStyle /><StyledMenu
      mode={mode || "vertical"}
      selectable={false}
      activeKey={pathname}
      expandIcon={theme.menu.icons.down}
    >
      {objToMenu(t, 0)}
    </StyledMenu></>);
  }
}
