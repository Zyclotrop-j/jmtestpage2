import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import * as Icons from 'grommet-icons';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import { colorIsDark  } from "grommet/utils";
import { isValid, parseISO, formatDistanceToNow } from 'date-fns';

const StyledVerticalTimeline = styled(VerticalTimeline)`
  body &::before {
    background: ${props => props.background};
  }
`;
const StyledVerticalTimelineElement = styled(VerticalTimelineElement)`
  & > div > .vertical-timeline-element-content {
    color: ${props => props.background};
    background: currentColor;
    box-shadow: ${props =>
      props?.global?.elevation?.[props?.elevation] ||
      props?.global?.elevation?.light?.[props?.elevation] ||
      "none"};
  }
  & > div > .vertical-timeline-element-content > * {
    color: ${props => (props.background && colorIsDark(props.background) )? "white" : "black"};
  }
  & > div > .vertical-timeline-element-content > .vertical-timeline-element-date {
    color: ${props => props.tagcolor || "initial"};
  }
  &.vertical-timeline-element--left > div > .vertical-timeline-element-content::before {
      border-left-color: currentColor;
  }
  &.vertical-timeline-element--right > div > .vertical-timeline-element-content::before {
        border-right-color: currentColor !important;
  }
`;

export default class VerticalTimelineComponent extends React.Component<any> {

  static defaultProps = {
    background: "#444",
    animate: true,
    layout: '2-columns',
    content: []
  }

  public render() {

    const {
      _id,
      animate,
      background,
      elevation,
      layout,
      content,
      dateformat,
      __children: { children = [] },
      __renderSubtree
    } = this.props;

    const dateFormatter = {
      absolute: date => parseISO(date).toLocaleDateString(),
      relative: date => formatDistanceToNow(date, { addSuffix: true }),
      none: date => date
    }[dateformat] || (date => date);

    const convertParseDate = date =>
      isValid(date) ?
      (<time datetime={parseISO(date).toISOString()}>{dateFormatter(date)}</time>):
      date;

    const content2 = children.map((u, idx) => (
      <StyledVerticalTimelineElement
        tagcolor={content?.[idx]?.tagcolor || "#111"}
        elevation={elevation}
        background={content?.[idx]?.background || "#EEE"}
        position={(idx % 2) ? "right" : "left"}
        className="vertical-timeline-element--work"
        date={convertParseDate(content?.[idx]?.tag)}
        iconStyle={{ background: content?.[idx]?.background || "#EEE", color: content?.[idx]?.color || "#111" }}
        icon={Icons[content?.[idx]?.icon] && React.createElement(Icons[content?.[idx]?.icon], {
          size: "large",
          color: content?.[idx]?.color || "#111"
        })}
        key={`key-${idx}`}
      >
        {u?.map(__renderSubtree)}
      </StyledVerticalTimelineElement>
    ));

    return (
        <StyledVerticalTimeline
          background={background}
          animate={animate}
          layout={layout}
        >
            {content2}
        </StyledVerticalTimeline>
    );
  }
}
