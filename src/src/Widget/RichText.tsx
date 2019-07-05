import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { tryCatch, identity } from "ramda";
import { Markdown, Paragraph, Anchor, Box, ResponsiveContext } from 'grommet';
import Image from 'react-shimmer';
import LazyLoad from 'react-lazyload';
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
      const as = props.href[0] === "/" ? { as: MDLink, to: props.href } : { rel: "noopener" };
      return <Anchor {...props} {...as} href={props.href} />;
    },
  },
  img: {
    component: props => {
      return (
        <LazyLoad height={200} once offset={100}>
          <Image {...props} width={250} height={100} />
        </LazyLoad>
      );
    },
  },
};

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

    return (
      <Box id={_id} className={className} gridArea={gridArea}>
        <Markdown components={components}>{pipeline(markdown || '')}</Markdown>
      </Box>
    );
  }
}
