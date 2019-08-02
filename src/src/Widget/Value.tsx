import React from 'react';
import styled from 'styled-components';
import { Box, Text } from "grommet";
import { Value as GValue } from 'grommet-controls';
import posed, { PoseGroup } from 'react-pose';
import CountUp from 'react-countup';
import Observer from '@researchgate/react-intersection-observer';
import { Icon } from "./Icon";
import { RichText } from "./RichText";

const MinHeightSpan = styled.span`
  min-height: 18px;
  min-width: 18px;
  padding-bottom: ${({ artificialHeight }) => artificialHeight}px;
  margin-bottom: -${({ artificialHeight }) => artificialHeight}px;
  display: inline-block;
`;

export const uiSchema = {
  color: {
    "ui:widget": "gromet-color"
  }
};

const schema = {
  "label": {
    "type": "string",
    "description": "The label (small text under the value)"
  },
  "value": {
    "type": "object",
    "properties": {
      "number": {
        "description": "The value to showcase. Despite the name, this is a string/text, e.g. '30%' or '10.000 Customers'",
        "type": "string"
      },
      "icon": {
        "description": "The icon to display with the value, e.g. 'de/Up' or 'de/Down'",
        "type": "string",
        "ui:widget": "icon"
      },
      "richtext": {
        "type": "string",
        "ui:widget": "markdown",
        "description": "Advanced: Use markdown for the value"
      }
    }
  },
  "color": {
    "description": "Choose a (theme-) color.",
    "type": "string",
    "ui:widget": "grommet-color"
  },
  "gap": {
    "type": "string",
    "description": "gap between the value and label: xsmall, small, medium, large, xlarge"
  },
  "size": {
    "type": "string",
    "description": "size of the spinner: xsmall, small, medium, large, xlarge"
  },
  "animate": {
    "type": "boolean",
    "default": true,
    "description": "Animate the number to count up to catch attention"
  },
  "activationMarginTop": {
    "type": "number",
    "description": "Value the user has to scroll over this element for the animation to activate.",
    "default": 60
  },
  "activationMarginBottom": {
    "type": "number",
    "description": "Value the user has to scroll over this element for the animation to reset the animation.",
    "default": 800
  }
};

const Item = posed.div({
  enter: { value: 100 },
  exit: { value: 0 }
})

export class Value extends React.PureComponent<Props> {

  static defaultProps = {
    label: "",
    color: "inherit",
    size: "medium",
    value: {
      number: "100%"
    },
    animate: true,
    activationMarginTop: 60,
    activationMarginBottom: 800
  }

  state = {}

  public render() {
    const {
      _id,
      className,
      label,
      value: {
        number = "",
        icon,
        richtext
      },
      color,
      gap,
      size,
      animate,
      activationMarginTop,
      activationMarginBottom
    } = this.props;

    const numbermatch = (animate && number.match(/^(.*?)([0-9]+)(.*)$/)) || ["","","",""];
    const [ prefix, end, suffix ] = numbermatch.slice(1,4);
    const counter = animate && end && !(NaN === parseInt(end)) ? (<CountUp
      start={0}
      end={parseInt(end)}
      prefix={prefix}
      suffix={suffix}
    >
      {({ countUpRef, start, reset, pauseResume }) => (
        <Observer root={typeof window !== `undefined` && (document.querySelector(".Pane.horizontal.Pane2") || document.querySelector("#page-wrap"))} rootMargin={`${activationMarginBottom}px 0px 0px 0px`} threshold={[0,1]} onChange={
          (evt) => {
            if(this.animationready && evt.intersectionRatio > 0.99) {
              start();
              this.animationready = false;
            }
            if(evt.intersectionRatio < 0.01) {
              reset();
              this.animationready = true;
            }
          }
        }>
          <MinHeightSpan artificialHeight={activationMarginTop} ref={countUpRef} />
        </Observer>
      )}
    </CountUp>) : number;

    const thisIcon = <Icon icon={icon} color={color} /> || <span />;
    const content = (richtext && richtext.trim()) ? <RichText urlescaped={false} escaped={false} b64={false} markdown={richtext}/> : (<Box direction='row' align='center' gap='xsmall'>
      <Text size='large' weight='bold' color={color}>
        {counter}
      </Text>
      {thisIcon}
    </Box>) || undefined;

    return (
      <GValue
        id={_id}
        className={className}
        color={color}
        gap={gap}
        size={size}
        value={content}
        label={label}
      />
    );
  }
}
