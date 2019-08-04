import React from 'react';
import styled from 'styled-components';
import { BaseBox } from "./BaseBox";

export const uiSchema = {};

const schema = {
  "title": "componentswitcher",
  "description": "Switch directly between horizontal and vertical layouts at a given (container width-based) breakpoint or 'threshold'",
  "type": "object",
  "properties": {
    "limit": {
      "description": "A number representing the maximum number of items permitted for a horizontal layout",
      "default": 5,
      "type": "number"
    },
    "space": {
      "description": "A CSS `margin` value",
      "default": "1rem",
      "type": "string"
    },
    "threshold": {
      "description": "A CSS `width` value (representing the 'container breakpoint')",
      "default": "30rem",
      "type": "string"
    },
    "proportions": {
      "description": "An array of different proportions given the index (eg second item in this array with value 2 would double the size of the second element)",
      "default": [1, 1, 1, 1, 1],
      "type": "array",
      "items": {
        "default": 1,
        "type": "number"
      }
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
  & > * {
    display: flex;
    flex-wrap: wrap;
    margin: calc((${props => props.space} / 2) * -1);
  }

  & > * > * {
    flex-grow: 1;
    flex-basis: calc((${props => props.threshold} - (100% - ${props => props.space})) * 999);
    margin: calc(${props => props.space} / 2);
  }

  & > * > :nth-last-child(n+${props => parseInt(props.space)+1}),
  & > * > :nth-last-child(n+${props => parseInt(props.space)+1}) ~ * {
    flex-basis: 100%;
  }

  ${props => props.proportions.map((i, idx) => i ? `
    & > * > :nth-child(${idx + 1}) {
      flex-grow: ${i};
    }
  ` : "")}
`;

export const Switcher = props => {
  const {
    limit,
    space,
    threshold,
    proportions,
    __children: { children = [] },
    __renderSubtree,
    gridArea,
    className,
    preview,
  } = props;

  const content = children.map((u, idx) => (
    <BaseBox preview={preview} key={u._id || idx}>
      {u?.map(__renderSubtree)}
    </BaseBox>
  ));
  const adjustedSpace = `${space}` === '0' ? '0px' : space;
  return <Container className={className} gridArea={gridArea} space={adjustedSpace || "0px"} threshold={threshold || "30rem"} limit={limit  || 5} proportions={proportions || []}>
    <div>{content}</div>
  </Container>;
};
Switcher.defaultProps = {
  limit: 5,
  space: "1rem",
  threshold: "30rem",
  proportions: [1, 1, 1, 1, 1],
  content: []
};
