import React from 'react';
import styled from 'styled-components';
import posed from 'react-pose';
import { Box, Button } from "grommet";

export const uiSchema = {};

const schema = {
  "title": "componentshowmore",
  "type": "object",
  "properties": {
    "initiallyOpen": {
      "description": "The initial state of the container. true means open",
      "default": false,
      "type": "boolean"
    },
    "showMore": {
      "description": "The text on the 'show-more' button",
      "default": "Show more",
      "type": "string"
    },
    "showLess": {
      "description": "The text on the 'show-less' button. Leave blank to omit the button",
      "default": "Show less",
      "type": "string"
    },
    "content": {
      "type": "string",
      "x-$ref": "componentgroup"
    }
  }
};

const itemConfig = {
  open: { height: 'auto' },
  closed: { height: '5rem' }
}
const Item = styled(posed.div(itemConfig))`
  overflow: hidden;
  position: relative;
`;
const StyledButton = styled(Button)`
  position: relative;
`;

const Tmp = props => {
  const {
    showLess,
    showMore,
    initiallyOpen,
    __children: { child = [] },
    __renderSubtree,
    gridArea,
    className,
  } = props;

  const [isOpen, dispatch] = React.useReducer(state => !state, initiallyOpen);
  const content = child.map(__renderSubtree);
  return <Box plain gridArea={gridArea} className={className}>
    <Item pose={isOpen ? 'open' : 'closed'}>
      {content}
    </Item>
    {(isOpen || (showLess && showLess.trim())) && <StyledButton plain onClick={dispatch} label={isOpen ? showLess : showMore}/>}
    {(showLess && showLess.trim()) && <hr />}
  </Box>;
};

//
export const ShowMore = props => <Tmp {...props} />;
ShowMore.defaultProps = {
  showMore: "Show more",
  showLess: "Show less",
  initiallyOpen: false
};
