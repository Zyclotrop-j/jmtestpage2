import React from 'react';
import styled from 'styled-components';
import { BaseBox } from "./BaseBox";

export const uiSchema = {};

const schema = {
  "title": "componentcenter",
  "description": "A custom element for injecting white space (margin) between flow (block) elements along a vertical axis.",
  "type": "object",
  "properties": {
    "max": {
      "description": "A CSS `max-width` value",
      "default": "60ch",
      "type": "string"
    },
    "andText": {
      "description": "Center align the text too (`text-align: center`)",
      "default": false,
      "type": "boolean"
    },
    "gutters": {
      "description": "The minimum space on either side of the content",
      "default": "0",
      "type": "string"
    },
    "intrinsic": {
      "description": "Center child elements based on their content width",
      "default": false,
      "type": "boolean"
    },
    "content": {
      "type": "array",
      "items": {
        "type": "string",
        "x-$ref": "componentgroup"
      }
    }
  }
};

const Container = styled.div`
  ${props => props.gridArea ? `grid-area: ${props.gridArea};` : ""}
  display: block;
  box-sizing: content-box;
  margin-left: auto;
  margin-right: auto;
  ${props => props.andText ? `text-align: center;` : ""}
  max-width: ${props => props.max || "var(--measure)"};
  padding-left: ${props => props.gutters};
  padding-right: ${props => props.gutters};
  ${props => props.intrinsic ? `
    display:flex;
    flex-direction: column;
    align-items: center;
  ` : ""}
`;

export const Center = props => {
  const {
    max,
    andText,
    gutters,
    intrinsic,
    __children: { children = [] },
    __renderSubtree,
    gridArea,
    className,
    preview,
  } = props;

  const content = children.map((u, idx) => (
    <BaseBox preview={preview} key={u?._id || idx}>
      {u?.map(__renderSubtree) || <div />}
    </BaseBox>
  ));
  return <Container className={className} gridArea={gridArea} max={max || "60ch"} andText={andText || false} gutters={gutters || "0"} intrinsic={intrinsic || false}>
    {content}
  </Container>;
};
Center.defaultProps = {
  max: "60ch",
  andText: false,
  gutters: "0",
  intrinsic: false,
  content: []
};
