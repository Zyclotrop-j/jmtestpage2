import React from 'react';
import styled from 'styled-components';

export const uiSchema = {};

const schema = {
  "title": "componentbasebox",
  "description": "A custom element for placing two elements side-by-side. If space permits, the sidebar element has a set width, and the companion takes up the rest of the available horizontal space. If not, the elements are collapsed into a single column, each taking up 100% of the horizontal space.",
  "type": "object",
  "properties": {
    "padding": {
      "description": "A CSS `padding` value",
      "default": "0px",
      "type": "string"
    },
    "borderWidth": {
      "description": "A CSS `border-width` value",
      "default": "0px",
      "type": "string"
    },
    "borderColor": {
      "description": "A CSS `border-color` value",
      "default": "",
      "type": "string"
    },
    "invert": {
      "description": "Whether to apply an inverted theme. Only recommended for greyscale designs.",
      "default": false,
      "type": "boolean"
    },
    "content": {
      "type": "string",
      "x-$ref": "componentgroup"
    }
  }
};

const BaseBaseBox = React.forwardRef((props, ref) => {
  const {
    children,
    __children,
    __renderSubtree,
    className,
  } = props;
  const child = __children?.child || [];

  const content = children || child.map(__renderSubtree);
  return <div className={className} ref={ref}>{children || content}</div>
});
BaseBaseBox.defaultProps = {
  padding: "0px",
  borderWidth: "0px",
  invert: false,
  borderColor: ""
};
export const BaseBox = styled(BaseBaseBox)`
  ${props => props.gridArea ? `grid-area: ${props.gridArea};` : ""}
  box-sizing: border-box;
  display: block;
  padding: ${props => props.padding || "0px"};
  border: ${props => props.borderWidth || "0px"} solid ${props => props.borderColor || ""};
  ${props => (props.invert || false) ? "filter: invert(100%);" : ''}
  background-color: inherit;
  outline: var(--s-5) solid transparent;
  outline-offset: calc(var(--s-5) * -1);
  ${props => props.preview ? `
    outline: 3px dashed silver;
  ` : ""}
`;
BaseBaseBox.defaultProps = BaseBox.defaultProps;
