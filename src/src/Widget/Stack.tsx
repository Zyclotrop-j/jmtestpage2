import React from 'react';
import styled from 'styled-components';
import { BaseBox } from "./BaseBox";

export const uiSchema = {};

const schema = {
  "title": "componentstack",
  "description": "A custom element for injecting white space (margin) between flow (block) elements along a vertical axis.",
  "type": "object",
  "properties": {
    "space": {
      "description": "A CSS `margin` value",
      "default": "1.5rem",
      "type": "string"
    },
    "splitAfter": {
      "description": "The element after which to _split_ the stack with an auto margin",
      "default": "",
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

const Container = styled.div`
  ${props => props.gridArea ? `grid-area: ${props.gridArea};` : ""}
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  & > * {
    margin-top: 0;
    margin-bottom: 0;
  }

  & > * + * {
    margin-top: ${props => props.space};
  }

  ${props => parseInt(props.splitAfter) > 0 ? `
    & > :nth-child(${props.splitAfter}) {
      margin-bottom: auto;
    }
  ` : ""}
`;

export const Stack = props => {
  const {
    splitAfter,
    space,
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
  return <Container className={className} gridArea={gridArea} space={adjustedSpace || "0px"} splitAfter={splitAfter}>
    {content}
  </Container>;
};
Stack.defaultProps = {
  splitAfter: null,
  space: "1rem",
  content: []
};
