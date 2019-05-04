import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { Text as GText } from 'grommet';

interface Props {
  b64: boolean;
  urlescaped: boolean;
  text: string;
}

export class Text extends React.PureComponent<Props> {
  public render() {
    const { b64, urlescaped, text, alignSelf, color, gridArea, margin, size, textAlign, truncate, weight } = this.props;

    // encode = window.btoa((encodeURIComponent(str)))
    // decode = decodeURIComponent((window.atob(b64)));
    const pipeline = [[b64, window.atob], [urlescaped, window.decodeURIComponent]]
      .filter(([t]) => t === true)
      .map(([__, f]) => f)
      .reduce((p, f) => x => f(p(x)), x => x);

    return <GText {...{ alignSelf, color, gridArea, margin, size, textAlign, truncate, weight }}>{pipeline(text)}</GText>;
  }
}
