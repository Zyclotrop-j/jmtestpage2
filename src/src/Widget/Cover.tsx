import React from 'react';
import styled, { css } from 'styled-components';
import { BaseBox } from "./BaseBox";

export const uiSchema = {};

const schema = {
  "title": "componentcover",
  "description": "A custom element for covering a block-level element horizontally, with a max-width value representing the typographic measure",
  "type": "object",
  "properties": {
    "space": {
      "description": "The minimum space between and around all of the child elements",
      "default": "1rem",
      "type": "string"
    },
    "minHeight": {
      "description": "The minimum height for the **Cover**",
      "default": "100vh",
      "type": "string"
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

const CenterClass = `${BaseBox}-center`;
console.log("IMPORTANT!!!!", BaseBox, CenterClass)
const Container = styled.div`
  ${props => props.gridArea ? `grid-area: ${props.gridArea};` : ""}
  display: flex;
  flex-direction: column;
  min-height: ${props => props.minHeight};
  padding: ${props => props.space};

  & > * {
    margin-top: ${props => props.space};
    margin-bottom: ${props => props.space};
  }

  & > :first-child:not(${CenterClass}) {
    margin-top: 0;
  }

  & > :last-child:not(${CenterClass}) {
    margin-bottom: 0;
  }

  & > ${CenterClass} {
    margin-top: auto;
    margin-bottom: auto;
  }
`;

export const Cover = props => {
  const {
    minHeight,
    space,
    __children: { children = [] },
    __renderSubtree,
    gridArea,
    className,
     preview,
  } = props;

  const content = children.map(u => u?.map(__renderSubtree));
  const foot = content.length >= 3 ? content.pop() : null;
  const head = content.lenght >= 2 ? content.shift() : null;

  return <Container className={className} gridArea={gridArea} minHeight={minHeight || "100vh"} space={space || "1rem"}>
    {head && <BaseBox preview={preview}>{head}</BaseBox>}
    <BaseBox preview={preview} className={CenterClass.substring(1)}>{content}</BaseBox>
    {foot && <BaseBox preview={preview}>{foot}</BaseBox>}
  </Container>;
};
Cover.defaultProps = {
  minHeight: "100vh",
  space: "1rem",
  content: []
};
