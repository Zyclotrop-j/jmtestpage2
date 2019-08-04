import React from 'react';
import styled from 'styled-components';
import { BaseBox } from "./BaseBox";

export const uiSchema = {};

const schema = {
  "title": "componentsidebar",
  "description": "A custom element for placing two elements side-by-side. If space permits, the sidebar element has a set width, and the companion takes up the rest of the available horizontal space. If not, the elements are collapsed into a single column, each taking up 100% of the horizontal space.",
  "type": "object",
  "properties": {
    "side": {
      "description": "A Which element to treat as the sidebar (all values but 'left' are considered 'right')",
      "default": "left",
      "type": "string"
    },
    "sideWidth": {
      "description": "Represents the width of the sidebar _when_ adjacent. If not set (`null`) it defaults to the sidebar's content width",
      "default": "intrinsic",
      "type": "string"
    },
    "contentMin": {
      "description": "A CSS **percentage** value. The minimum width of the content element in the horizontal configuration",
      "default": "50%",
      "type": "string"
    },
    "space": {
      "description": "A CSS margin value representing the space between the two elements",
      "default": "1rem",
      "type": "string"
    },
    "noStretch": {
      "description": "Make the adjacent elements adopt their natural height",
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
  overflow: hidden;
  & > * {
    ${props => props.noStretch ? 'align-items: flex-start;' : ''}
    display: flex;
    flex-wrap: wrap;
    margin: calc(${props => props.space} / 2 * -1);
  }

  & > * > * {
    margin: calc(${props => props.space} / 2);
    ${props => props.width && props.width.trim() && props.width.toLowerCase() !== "intrinsic" && props.width.toLowerCase() !== "none" ? `flex-basis: ${props.width};` : ""}
    flex-grow: 1;
  }

  & > * > ${props => props.onRight ? ":first-child" : ":last-child"} {
    flex-basis: 0;
    flex-grow: 999;
    min-width: calc(${props => props.minWidth} - ${props => props.space});
  }
`;

export const Sidebar = props => {
  const {
    side,
    sideWidth,
    contentMin,
    space,
    noStretch,
    __children: { children = [] },
    __renderSubtree,
    gridArea,
    className,
     preview,
  } = props;

  const [firstItem = <div />, ...content] = children.map((u, idx) => u?.map(__renderSubtree));
  const adjustedSpace = `${space}` === '0' ? '0px' : space;
  const onRight = `${side}`.toLowerCase() !== 'left';
  return <Container className={className} gridArea={gridArea} space={adjustedSpace || "0px"} width={sideWidth || ""} minWidth={contentMin || "50%"} noStretch={noStretch || false} onRight={onRight || false}>
    <div>
      <BaseBox preview={preview}>{onRight ? firstItem : content}</BaseBox>
      <BaseBox preview={preview}>{onRight ? content: firstItem}</BaseBox>
    </div>
  </Container>;
};
Sidebar.defaultProps = {
  side: "left",
  sideWidth: "intrinsic",
  contentMin: "50%",
  space: "1rem",
  noStretch: false,
  content: []
};
