import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { Text as GText, TextInput } from 'grommet';

interface Props {
  b64: boolean;
  urlescaped: boolean;
  text: string;
  gridArea: string;
}

export const uiSchema = {
  text: {
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
};


export class Text extends React.PureComponent<Props> {
  public render() {
    const { b64, urlescaped, text, alignSelf, color, gridArea, margin, size, textAlign, truncate, weight } = this.props;

    // encode = window.btoa(encodeURIComponent(str))
    // decode = decodeURIComponent(window.atob(b64));
    const pipeline = [[b64, window.atob], [urlescaped, window.decodeURIComponent]]
      .filter(([t]) => t === true)
      .map(([__, f]) => f)
      .reduce((p, f) => x => f(p(x)), x => x);

    return (
      <GText
        gridArea={gridArea}
        alignSelf={alignSelf}
        color={color}
        margin={margin}
        size={size}
        textAlign={textAlign}
        truncate={truncate}
        weight={weight}
      >
        {pipeline(text)}
      </GText>
    );
  }
}
