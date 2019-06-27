import React from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'gatsby';
import { Box } from 'grommet';
import { colorStyle } from 'grommet-styles';
import { memoizeWith, identity } from "ramda";
import includedIcons from "../utils/usedIcons";

export const uiSchema = {
  icon: {
    "ui:widget": "icon"
  }
};

const colorCss = css`
  ${props => colorStyle('fill', props.color || props.theme.global.colors.icon, props.theme)}
  ${props => colorStyle('stroke', props.color || props.theme.global.colors.icon, props.theme)}
`;

const StyledIcon = memoizeWith(identity, (iName, icon) => styled(icon)`
  display: inline-block;
  flex: 0 0 auto;
  ${({ size = 'medium', theme }) => `
    width: ${theme?.icon?.size[size] || size};
    height: ${theme?.icon?.size[size] || size};
  `}
  ${({ color }) => color !== 'plain' && colorCss}
  ${({ theme }) => theme?.icon?.extend}
`);

interface Props {}

const schema = {
  "description": "An icon. Can be one from many, use icon-widget to choose existing and displayable icon.",
  "properties": {
    "icon": {
      "type": "string",
      "ui:widget": "icon",
      "description": "Icon name in form of <lib>/<icon>, e.g. de/Aed, gi/GiSpiderBot or fi/FiHeart. Lazy loads icons!"
    },
    "color": {
      "type": "string",
      "ui:widget": "grommet-color",
      "description": "Color of the icon, can use theme-colors"
    },
    "size": {
      "type": "string",
      "description": "Size of the icon. xsmall, small, medium, large, xlarge or css-size"
    }
  },
  "type": "object",
  "title": "componenticon",
  "_draft": false
};

export class Icon extends React.PureComponent<Props> {

  static defaultProps = {
    icon: "",
    color: "",
    size: "medium"
  }

  state = {}

  private importIcon(icon) {
    if(includedIcons[icon.substring(3)]) {
      return;
    }
    if(!icon || icon.length < 4) {
      return Promise.resolve();
    }

        const getIconWrapper = () => import(/* webpackMode: "lazy" */ "react-icons-kit");
        const importFn = {

          // gi: () => import(/* webpackMode: "lazy" */ "react-icons/gi"), // game icons

          de: () => import(/* webpackMode: "lazy" */ "grommet-icons"), // grommet icons

          bl: () =>  import(/* webpackMode: "lazy" */ "styled-icons/boxicons-logos"),
          br: () =>  import(/* webpackMode: "lazy" */ "styled-icons/boxicons-regular"),
          bs: () =>  import(/* webpackMode: "lazy" */ "styled-icons/boxicons-solid"),
          cr: () =>  import(/* webpackMode: "lazy" */ "styled-icons/crypto"),
          ev: () =>  import(/* webpackMode: "lazy" */ "styled-icons/evil"),
          im: () =>  import(/* webpackMode: "lazy" */ "styled-icons/icomoon"),

          fa: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/fa"),
          io: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/iconic"),
          ia: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/ionicons"),
          md: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/md"),
          ti: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/typicons"),
          go: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/oct"),
          fi: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/feather"),

          ty: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/entypo"),
          ik: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/ikons"),
          me: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/metrize"),
          li: () =>  import(/* webpackMode: "lazy" */ "react-icons-kit/linea"),
          no: () =>
            Promise.all([import(/* webpackMode: "lazy" */ "react-icons-kit/noto_emoji_regular"),
            import(/* webpackMode: "lazy" */ "../utils/utf8EmojiMetadata")]).then(([noto, meta]) => {
              return Object.entries(noto).reduce((p, [k, v]) => ({ ...p, [meta[k] || k]: v }), {})
            }),

        }[`${icon[0]}${icon[1]}`] || (() => import(/* webpackPrefetch: true, webpackMode: "lazy" */ "grommet-icons"));



        return importFn().then(lib => {
          if(!lib[icon.substring(3)]) {
            return Promise.resolve();
          }
          if(["fa", "io", "md", "ti", "go", "fi", "ty", "ik", "me", "li", "no"].includes(`${icon[0]}${icon[1]}`)) {
            return getIconWrapper().then(({ default: Icon }) => {
              return props => <Icon {...props} icon={lib[icon.substring(3)]} />;
            });
          }
          return lib[icon.substring(3)]
        });
  }

  public componentDidMount() {
    if(includedIcons[this.props.icon.substring(3)]) {
      return;
    }
    this.importIcon(this.props.icon).then(i => this.setState({ icon: i }));
  }

  public componentDidUpdate(prevProps) {
    if(includedIcons[this.props.icon.substring(3)]) {
      return;
    }
    if (this.props.icon !== prevProps.icon) {
      this.importIcon(this.props.icon).then(i => this.setState({ icon: i }));
    }
  }

  public render() {
    const { _id, a11yTitle, icon, gridArea, alignSelf, justifySelf, className, ...other } = this.props;
    const M = ({ children }) => (gridArea && gridArea.trim() ?
      <Box className={className} alignSelf={alignSelf} justifySelf={justifySelf} gridArea={gridArea}>{children}</Box> :
      <>{children}</>);
    if(!icon) {
      const Fallback = StyledIcon("PlainFallback", "svg");
      return (<M><Fallback id={_id} data="No-icon" className={gridArea && gridArea.trim() ? "": className} viewBox='0 0 24 24' aria-hidden={true} {...other} /></M>);
    };
    if(includedIcons[icon.substring(3)]) {
      console.log("includedIcons[icon.substring(3)]", includedIcons[icon.substring(3)], includedIcons);
      const Icon = StyledIcon(icon, includedIcons[icon.substring(3)]);
      return (<M><Icon className={gridArea && gridArea.trim() ? "": className} aria-label={a11yTitle || icon.substring(3)} id={_id} {...other} /></M>);
    }
    if(!this.state.icon) {
      const Fallback = StyledIcon("PlainFallback", "svg");
      return (<M><Fallback id={_id} data="Loading-icon" className={gridArea && gridArea.trim() ? "": className} viewBox='0 0 24 24' aria-hidden={true} {...other} /></M>);
    };
    const Icon = StyledIcon(icon, this.state.icon);
    return (<M><Icon className={gridArea && gridArea.trim() ? "": className} aria-label={a11yTitle || icon.substring(3)} id={_id} {...other} /></M>);
  }
}
