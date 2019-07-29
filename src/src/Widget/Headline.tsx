import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { Heading } from 'grommet';
import { OutboundLink } from 'gatsby-plugin-gtag';
import { HeadlineContext } from "../utils/headlineContext";

interface Props {
  a11yTitle: string;
  alignSelf: string;
  color: string;
  href: string;
  gridArea: string;
  level: string;
  margin: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  size: string;
  textAlign: string;
  truncate: string;
}

export class Headline extends React.PureComponent<Props> {

  public render() {
    const { _id, className, a11yTitle, alignSelf, color, href, gridArea, level, margin = {}, size, textAlign, truncate, text } = this.props;

    const localLink = href && (/^\/(?!\/)/.test(href) ?
      { href, as: styled(Link)``, to: href } :
      { href, as: styled(OutboundLink)``, rel: "noopener", referrerpolicy: "origin" });
    const linkProps = href
      ? localLink
      : {};

    return (<HeadlineContext.Consumer>
        {def => (<Heading
          id={_id}
          a11yTitle={a11yTitle}
          alignSelf={alignSelf || 'stretch'}
          color={color}
          gridArea={gridArea}
          data-depth={def}
          level={level || def}
          margin={{
            top: margin?.top,
            bottom: margin?.bottom,
            left: margin?.left,
            right: margin?.right,
          }}
          size={size}
          textAlign={textAlign}
          truncate={truncate}
          {...linkProps}
          className={className}
        >
          {text}
        </Heading>)}
    </HeadlineContext.Consumer>);
  }
}
