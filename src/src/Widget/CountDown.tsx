import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RichText } from "./RichText";
import { DateContext } from '../utils/DateContext';

const BBox = styled.div`
  ${props => props.gridArea ? `grid-area: ${props.gridArea};` : ""}
`;

interface Props {}

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

const stampHook = ({ end_time, interval = 1000 }) => {
  const [distance, setDistance] = useState(end_time - (new Date()));
  const _second = 1000;
  const _minute = _second * 60;
  const _hour = _minute * 60;
  const _day = _hour * 24;
  let frame;

  useEffect(() => {
    const timer = setInterval(() => {
      if(window.requestAnimationFrame) {
        if(frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => setDistance(end_time - (new Date())));
      } else {
        setDistance(end_time - (new Date()))
      }
    }, interval);
    return () => clearInterval(timer);
  });
  return {
    distance,
    expired: distance < 0,
    days: Math.floor(distance / _day),
    hours: Math.floor((distance % _day) / _hour),
    minutes: Math.floor((distance % _hour) / _minute),
    seconds: Math.floor((distance % _minute) / _second)
  };
};

const Stamp = props => {
  const {
    richtext,
    expiredmarkdown,
    _id,
    gridArea,
    end_time
  } = props;
  const {
    expired,
    days,
    hours,
    minutes,
    seconds
  } = stampHook({ end_time });

  return (<DateContext.Provider value={end_time}><BBox gridArea={gridArea} id={_id} role="alert" aria-live="assertive">
    {expired && <RichText markdown={expiredmarkdown} urlescaped={false} b64={false} />}
    {!expired && <RichText __addtional_components={{
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
    }} markdown={richtext} urlescaped={false} b64={false} />}
  </BBox></DateContext.Provider>);
}

export class CountDown extends React.PureComponent<Props> {

  public render() {
    const {
      endTime,
      richtext,
      expired: expiredmarkdown,
      _id,
      gridArea,
    } = this.props;

    const end_time = new Date(endTime);
    return <Stamp end_time={end_time} richtext={richtext} expiredmarkdown={expiredmarkdown} _id={_id} gridArea={gridArea} />;
  }
}

CountDown.defaultProps = {
  expired: "The *future* is now",
  richtext: "<formatted /> (<seconds/>s, <minutes/>m, <hours/>h, <days/>d = <formattedStrict />)",
  endTime: "2050-01-01 00:00:00"
};
