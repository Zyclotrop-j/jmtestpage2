import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import ReactDOM from 'react-dom';
import { once } from "ramda";

interface Props {

}

const Li = styled.li`
  ${props => props.preview ? `
    outline: 3px dashed silver;
  ` : ""}
`;

const Ul = styled.ul`
  columns: ${props => props.columns};
  column-gap: ${props => props.gap};
  ${Li} {
    column-span: all;
  }
  ${Li}:nth-last-child(n+${props => props.breakat}),
  ${Li}:nth-last-child(n+${props => props.breakat}) ~ * {
    column-span: none;
  }
`;

export const uiSchema = {};

const schema = {
  "title": "componenttaglist",
  "type": "object",
  "properties": {
    "columns": {
      "description": "Number of columns the content breaks into",
      "maximum": 5,
      "minimum": 2,
      "default": 2,
      "type": "string"
    },
    "gap": {
      "description": "gap between columns, any valid CSS size",
      "default": "1rem",
      "type": "string"
    },
    "breakat": {
      "description": "Number of items that fit vertically, if they can take th whole space",
      "minimum": 3,
      "maximum": 20,
      "default": 5,
      "type": "number"
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

export const TagList = (props) => {

  const {
    _id,
    __children: { children = [] },
    __renderSubtree,
    columns,
    gap,
    breakat,
    preview
  } = props;

  const content = children.map((u, idx) => (
    <Li preview={preview} key={u._id || idx}>
      {u?.map(__renderSubtree)}
    </Li>
  ));

  return (<Ul columns={columns || 2} gap={gap || "1rem"} breakat={breakat || 5}>
    {content}
  </Ul>)
};
TagList.defaultProps = {
  columns: 2,
  gap: "1rem",
  breakat: 5,
  content: []
};
