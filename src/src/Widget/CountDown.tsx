import React from 'react';
import styled from 'styled-components';
import { formatDistance } from 'date-fns';
import Livestamp from 'react-livestamp';
import { RichText } from "./RichText";

interface Props {}

// // TODO: Add to index, page and gatsby-node.js, group, schema

export const uiSchema = {};

const schema = {
  "title": "componentcountdown",
  "type": "object",
  "properties": {
    "endTime": {
      "description": "The end time this count-down counts down to",
      "format": "date-time",
      "default": "",
      "type": "string"
    },
    "richtext": {
      "description": "The text of the count-down; use <formatted />, <seconds/>, <minutes/>, <hours/> and <days/>",
      "default": "<formatted /> (<seconds/>s, <minutes/>m, <hours/>h, <days/>d)",
      "type": "string",
      "ui:widget": "markdown",
    },
    "expired": {
      "description": "The text of the count-down when the count-down has expired",
      "default": "The future is now!",
      "type": "string",
      "ui:widget": "markdown",
    }
  }
};

export class CountDown extends React.PureComponent<Props> {

  public render() {
    const {
      endTime,
      richtext,
      expired,
      _id,
      gridArea,
    } = this.props;


    const end_time = new Date(endTime);
    return (<Livestamp id={_id} role="alert" aria-live="assertive" end={end_time} renderStamp={({ days, hours, minutes, seconds }) => (
        <RichText __addtional_components={{
          days: {
            component: props => <span>{days}</span>
          },
          hours: {
            component: props => <span>{hours}</span>
          },
          minutes: {
            component: props => <span>{minutes}</span>
          },
          seconds: {
            component: props => <span>{seconds}</span>
          },
          formatted: {
            components: props => formatDistance(end_time, new Date(), {
              includeSeconds: true,
              addSuffix: true,
            })
          },
          Days: {
            component: props => <span>{days}</span>
          },
          Hours: {
            component: props => <span>{hours}</span>
          },
          Minutes: {
            component: props => <span>{minutes}</span>
          },
          Seconds: {
            component: props => <span>{seconds}</span>
          },
          Formatted: {
            components: props => formatDistance(end_time, new Date(), {
              includeSeconds: true,
              addSuffix: true,
            })
          }
        }} markdown={richtext} urlescaped={false} b64={false} />
      )} renderExpired={() => <RichText markdown={expired} urlescaped={false} b64={false} />} />);
  }
}

CountDown.defaultProps = {
  expired: "The *future* is now",
  richtext: "<formatted /> (<seconds/>s, <minutes/>m, <hours/>h, <days/>d)",
  endTime: "2050-01-01"
};
