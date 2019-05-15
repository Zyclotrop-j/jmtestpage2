import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { Heading } from 'grommet';

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
    const { a11yTitle, alignSelf, color, href, gridArea, level, margin = {}, size, textAlign, truncate, text } = this.props;

    const linkProps = href
      ? {
          href,
          as: styled(Link)``,
          to: href,
        }
      : {};

    return (
      <Heading
        a11yTitle={a11yTitle}
        alignSelf={alignSelf || 'stretch'}
        color={color}
        gridArea={gridArea}
        level={level}
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
      >
        {text}
      </Heading>
    );
  }
}
