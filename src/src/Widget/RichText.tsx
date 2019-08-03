import React from 'react';
import styled from 'styled-components';
import { Link, StaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
import { tryCatch, identity, is } from "ramda";
import { Markdown, Paragraph, Anchor, Box, ResponsiveContext } from 'grommet';
import Image from 'react-shimmer';
import LazyLoad from 'react-lazyload';
import { OutboundLink } from 'gatsby-plugin-gtag';
import defer from "lodash/defer";
import { Icon } from "./Icon";
import { atob, decodeURIComponent, escape } from "../utils/b64";

interface Props {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  timeToRead: number;
  category: string;
  gridArea: string;
}

const toUpperFirst = str => str.charAt(0).toUpperCase() + str.slice(1);
const isString = is(String);

export const uiSchema = {
  /* // currently doesn't play well together with the markdown editor
  markdown: {
    "ui:widget": "transformInput",
    "ui:options": { "transform": ["b64", "urlescaped"] },
    "ui:title": "Content",
    "ui:description": "Type your richttext here"
  },
  b64: {
    "ui:widget": "constantInput",
    "ui:options": { constant: true }
  },
  urlescaped: {
    "ui:widget": "constantInput",
    "ui:options": { constant: true }
  },
  */
};

const newline = `\n`;

const mqs= [
  ["Mobile", "small"],
  ["Tablet", "medium"],
  ["Desktop", "large"],
];
const mq = sizes => ({ children }) => {
  return (<ResponsiveContext.Consumer>
    {(size) => sizes.includes(size) ? <>{children}</> : null}
  </ResponsiveContext.Consumer>)
};

const AbsBox = styled(Box)`
  top: ${props => props.top || "unset"};
  bottom: ${props => props.bottom || "unset"};
  left: ${props => props.left || "unset"};
  right: ${props => props.right || "unset"};
  position: absolute;
`;

const allmqs = mqs.map(i => i[1]);
export const components = {
  AbsBox,
  Abs: AbsBox,
  Icon: {
    component: props => <Icon {...props} />
  },
  ...mqs.reduce((p, [name, size]) => ({
    ...p,
    [`Not${name}`]: mq(allmqs.filter(i => i !== size)),
    [`${name}`]: mq([size])
  }), {}),
  a: {
    component: props => {
      const MDLink = styled(Link)``;
      const islocal = /^\/(?!\/)/.test(props.href);
      const as = islocal ? { as: MDLink, to: props.href } : { as: OutboundLink, rel: "noopener", referrerpolicy: "origin" };
      return <Anchor {...props} {...as} href={props.href} />;
    },
  },
  img: {
    component: props => {
      return (
        <LazyLoad scrollContainer="#page-wrap" height={200} once offset={100}>
          <Image {...props} width={250} height={100} />
        </LazyLoad>
      );
    },
  },
};

const ur = x => {
  if(x.startsWith("ENCRYPT_")) {
    return x.substring("ENCRYPT_".length).split("-").map((i, idx) => String.fromCharCode(i - idx)).join("");
  }
  return x;
};
const DelayedRender = ({
  children
}) => {
  const [hasComponent, setComponent] = React.useState(null);
  React.useEffect(() => {
    defer(() => setComponent(true));
  });
  return hasComponent ? ur(`${children}`) : <span hidden aria-hidden style={{ display: "none" }}>{
    children
  }</span>;
}

export class RichText extends React.PureComponent<Props> {

  static defaultProps = {
    urlescaped: true,
    b64: true,
  }

  public render() {
    const { _id, className, markdown, urlescaped, escaped, b64, gridArea } = this.props;

    // encode = window.btoa(unescape(encodeURIComponent(str)))
    // decode = decodeURIComponent(escape(window.atob(b64)));
    const pipeline = [[b64, tryCatch(atob, identity)], [escaped, tryCatch(escape, identity)], [urlescaped, tryCatch(decodeURIComponent, identity)]]
      .filter(([t]) => t === true)
      .map(([__, f]) => f)
      .reduce((p, f) => x => f(p(x)), x => x);

    return (<StaticQuery
      query={graphql`
        query SiteMetaDataQuery {
          site {
            siteMetadata {
              siteUrl
              name
              firstname
              lastname
              addr
              email
              phone
            }
          }
        }
      `}
      render={data => (
        <Box id={_id} className={className} gridArea={gridArea}>
          <Markdown components={{
            ...Object.entries(data.site.siteMetadata).reduce((p, [k, v]) => isString(v) ? ({
              ...p,
              [toUpperFirst(k)]: {component: () => <DelayedRender children={v} />},
            }) : p, {}),
            ...components
          }}>{pipeline(markdown || '')}</Markdown>
        </Box>
      )}
    />);
  }
}
