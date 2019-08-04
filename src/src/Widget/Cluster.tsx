import React from 'react';
import styled from 'styled-components';
import { BaseBox } from "./BaseBox";

export const uiSchema = {};

const schema = {
  "title": "componentcluster",
  "description": "A custom element for placing two elements side-by-side. If space permits, the sidebar element has a set width, and the companion takes up the rest of the available horizontal space. If not, the elements are collapsed into a single column, each taking up 100% of the horizontal space.",
  "type": "object",
  "properties": {
    "justify": {
      "description": "A CSS `justify-content` value",
      "default": "left",
      "type": "string"
    },
    "align": {
      "description": "A CSS `align-items` value",
      "default": "intrinsic",
      "type": "string"
    },
    "space": {
      "description": "A CSS `margin` value. The minimum space between the clustered child elements.",
      "default": "1rem",
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
  overflow: hidden;

  & > * {
    display: flex;
    flex-wrap: wrap;
    justify-content: ${props => props.justify};
    align-items: ${props => props.align};
    margin: calc(${props => props.space} / 2 * -1);
  }

  & > * > * {
    margin: calc(${props => props.space} / 2);
  }
`;

export const Cluster = props => {
  const {
    justify,
    align,
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
  return <Container className={className} gridArea={gridArea} space={adjustedSpace || "0px"} justify={justify || "center"} align={align || "center"}>
    <div>
      {content}
    </div>
  </Container>;
};
Cluster.defaultProps = {
  justify: "center",
  align: "center",
  space: "1rem",
  content: []
};
