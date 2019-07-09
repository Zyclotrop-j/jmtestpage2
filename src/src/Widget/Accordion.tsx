import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import {
    Accordion as XAccordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';

const fadein = keyframes`
  0% {
      opacity: 0;
  }

  100% {
      opacity: 1;
  }
`;
const StyledAccordion = styled(XAccordion)`
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 2px;
`;
const StyledAccordionItem = styled(AccordionItem)`
  & + & {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
`;
const StyledAccordionItemHeading = styled(AccordionItemHeading)``;
const StyledAccordionItemButton = styled(AccordionItemButton)`
  background-color: #f4f4f4;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  text-align: left;
  border: none;
  &:hover {
    background-color: #ddd;
  }
  &:before {
    display: inline-block;
    content: '';
    height: 10px;
    width: 10px;
    margin-right: 12px;
    border-bottom: 2px solid currentColor;
    border-right: 2px solid currentColor;
    transform: rotate(-45deg);
  }
  &[aria-expanded='true']::before,
  &[aria-selected='true']::before {
      transform: rotate(45deg);
  }
`;
const StyledAccordionItemPanel = styled(AccordionItemPanel)`
  padding: 20px;
  animation: ${fadein} 0.35s ease-in;
`;

export class Accordion extends React.Component<any> {

  static defaultProps = {
    allowMultipleExpanded: false,
    allowZeroExpanded: false,
    preExpanded: [],
    level: 3,
  }

  public render() {

    const {
      _id,
      allowMultipleExpanded,
      allowZeroExpanded,
      level,
      preExpanded,
      content,
      __children: { children = [] },
      __renderSubtree
    } = this.props;

    const content2 = children.map((u, idx) => (
      <StyledAccordionItem
        uuid={`${_id}-${idx}`}
        key={u ? u._id : idx}
      >
          <StyledAccordionItemHeading
            aria-level={level}
          >
              <StyledAccordionItemButton>
                  {content?.[idx]?.headline}
              </StyledAccordionItemButton>
          </StyledAccordionItemHeading>
          <StyledAccordionItemPanel>
              {u?.map(__renderSubtree)}
          </StyledAccordionItemPanel>
      </StyledAccordionItem>
    ));

    return (
        <StyledAccordion
          allowMultipleExpanded={allowMultipleExpanded}
          allowZeroExpanded={allowZeroExpanded}
          preExpanded={preExpanded && preExpanded.map(i => `${_id}-${i}`)}
        >
            {content2}
        </StyledAccordion>
    );
  }
}
