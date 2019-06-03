import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'gatsby';
import { maxBy, tryCatch, nthArg, is, mergeDeepRight, memoizeWith } from "ramda";
import Img from 'gatsby-image';
import { Markdown, Paragraph, Anchor, Box, Heading, Button, Text } from 'grommet';
import posed, { PoseGroup, popmotion } from 'react-pose';
import { tween } from 'popmotion';
import TextLoop from "react-text-loop";
import BackgroundImage from 'gatsby-background-image';
import * as reactAnimations from 'react-animations';
import { gcd } from 'mathjs';
import Observer from '@researchgate/react-intersection-observer';
import { Attribution, Pingback, ImgBox } from "./Picture";
import { components } from "./RichText";

const effects = [
  "bouceOut",
  "bounce",
  "bounceIn",
  "bounceInDown",
  "bounceInLeft",
  "bounceInRight",
  "bounceInUp",
  "bounceOutDown",
  "bounceOutLeft",
  "bounceOutRight",
  "bounceOutUp",
  "fadeIn",
  "fadeInDown",
  "fadeInDownBig",
  "fadeInLeft",
  "fadeInLeftBig",
  "fadeInRight",
  "fadeInRightBig",
  "fadeInUp",
  "fadeInUpBig",
  "fadeOut",
  "fadeOutDown",
  "fadeOutDownBig",
  "fadeOutLeft",
  "fadeOutLeftBig",
  "fadeOutRight",
  "fadeOutRightBig",
  "fadeOutUp",
  "fadeOutUpBig",
  "flash",
  "flip",
  "flipInX",
  "flipInY",
  "flipOutX",
  "flipOutY",
  "headShake",
  "hinge",
  "jello",
  "lightSpeedIn",
  "lightSpeedOut",
  "pulse",
  "rollIn",
  "rollOut",
  "rotateIn",
  "rotateInDownLeft",
  "rotateInDownRight",
  "rotateInUpLeft",
  "rotateInUpRight",
  "rotateOut",
  "rotateOutDownLeft",
  "rotateOutDownRight",
  "rotateOutUpLeft",
  "rotateOutUpRight",
  "rubberBand",
  "shake",
  "slideInDown",
  "slideInLeft",
  "slideInRight",
  "slideInUp",
  "slideOutDown",
  "slideOutLeft",
  "slideOutRight",
  "slideOutUp",
  "swing",
  "tada",
  "wobble",
  "zoomIn",
  "zoomInDown",
  "zoomInLeft",
  "zoomInRight",
  "zoomInUp",
  "zoomOut",
  "zoomOutDown",
  "zoomOutLeft",
  "zoomOutRight",
  "zoomOutUp",
  "merge",
  "fadeIn",
  "fadeOut"
];

interface Props {
  b64: boolean;
  urlescaped: boolean;
  text: string;
  gridArea: string;
}

export const uiSchema = {
  slides: {
    items: {
      image: {
        "ui:field": "attributedpicture"
      }
    }
  }
};

const isString = is(String);

const AbsBox = styled(Box)`
  top: ${props => props.top || "unset"};
  bottom: ${props => props.bottom || "unset"};
  left: ${props => props.left || "unset"};
  right: ${props => props.right || "unset"};
  position: absolute;
`;
const Textflipper = props => {
  const modChildren = React.Children.toArray(props.children).reduce((p, i) => p.concat(
    isString(i) ? i.split("\n").filter(i => i.trim() !== "").map(i => <span>{i}</span>) : [i]
  ), []);
  return <TextLoop>{modChildren}</TextLoop>;
}

const bounceIn = {
  from: {
    opacity: 0,
    transform: "scale3d(0.3, 0.3, 0.3)"
  },
  enter: {
    opacity: 1,
    transform: "scale3d(1,1,1)",
    transition: {
      transform: { type: 'spring', stiffness: 100 },
      default: { ease: 'linear', duration: 500 }
    }
  }
};

const bounceInUp = {
  from: {
    opacity: 0,
    y: 200
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      y: { type: 'spring', stiffness: 100 },
      opacity: ({ from, to }) => ({
        type: 'keyframes',
        values: [from, to, to],
        times: [0, 0.6, 1]
      }),
      default: { ease: 'linear', duration: 500 }
    }
  }
};

const bounceInLeft = {
  from: {
    opacity: 0,
    x: -200
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      x: { type: 'spring', stiffness: 100 },
      opacity: ({ from, to }) => ({
        type: 'keyframes',
        values: [from, to, to],
        times: [0, 0.6, 1]
      }),
      default: { ease: 'linear', duration: 500 }
    }
  }
};

const bounceOutLeft = {
  enter: {
    opacity: 1,
    x: 0
  },
  exit: {
    opacity: 0,
    x: -200,
    transition: {
      x: { type: 'spring', stiffness: 100, velocity: 2000 },
      x: { type: 'decay', velocity: -200 },
      opacity: ({ from, to }) => ({
        type: 'keyframes',
        values: [from, from, to],
        times: [0, 0.6, 1]
      }),
      default: { ease: 'linear', duration: 500 }
    }
  }
};

const slideInLeft = {
  from: {
    opacity: 0,
    x: "-100%"
  },
  enter: {
    x: 0,
    transition: {
      default: { ease: 'linear', duration: 500 }
    }
  }
};

const slideOutLeft = {
  enter: {
    opacity: 1,
    x: 0
  },
  exit: {
    opacity: 0,
    x: "-100%",
    transition: {
      default: { ease: 'linear', duration: 500 }
    }
  }
};

const slideInRight = {
  from: {
    opacity: 0,
    x: "100%"
  },
  enter: {
    x: 0,
    transition: {
      default: { ease: 'linear', duration: 500 }
    }
  }
};

const slideOutRight = {
  enter: {
    opacity: 1,
    x: 0
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: {
      default: { ease: 'linear', duration: 500 }
    }
  }
};

const fadeIn = {
  from: {
    opacity: 0,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    x: 0,
    y: 0
  },
  enter: {
    opacity: 1,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    x: 0,
    y: 0
  },
  transition: {
    default: { ease: 'linear', duration: 1500 }
  }
};
const fadeOut = {
  enter: {
    opacity: 1,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    x: 0,
    y: 0
  },
  exit: {
    opacity: 0,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    x: 0,
    y: 0
  },
  transition: {
    default: { ease: 'linear', duration: 1500 }
  }
};

const inAnimations = {
  "fade-in": fadeIn,
  "bounce-in": bounceIn,
  "bounce-in-up": bounceInUp,
  "bounce-in-left": bounceInLeft,
  "slide-in-left": slideInLeft,
  "slide-in-right": slideInRight
};
const outAnimations = {
  "fade-out": fadeOut,
  "slide-out-left": slideOutLeft,
  "slide-out-right": slideOutRight
};
const memoInOutPosed = memoizeWith((enter, exit) => `${enter}${exit}`);
const memoAnimatedPose = memoInOutPosed((enter, exit) => {
  const PoseAnimated = posed.div(mergeDeepRight(inAnimations[enter], outAnimations[exit]))
  return styled(PoseAnimated)`
    top: 0;
    left: 0;
    position: absolute;
  `;
});

const CBox = styled(Box)`
  width: ${props => props.preview ? /*
    the preview is smaller than 100vw due to the side-panels
    can't use 100%, as it becomes 0px for the absolute slides
  */ "70vw": "100vw"};
  height: ${props => props.height}vh;
  transition: height 0.1s;
`;
const FBox = styled(Box)`
  position: absolute;
  left: ${({ left }) => left};
  right: ${({ right }) => right};
  top: ${({ top }) => top};
  bottom: ${({ bottom }) => bottom};
`;
const getKeyframes = memoizeWith(animationName => `${animationName}`,nName => keyframes`${reactAnimations[nName]}}`);
const AnimatedHeading = styled(Heading)`
  animation: 1s ${props => props.animation && getKeyframes(props.animation)};
  animation-delay: ${props => props.delay || 0}s;
  animation-fill-mode: both;
`;
const AnimatedParagraph = styled(Paragraph)`
  animation: 1s ${props => props.animation && getKeyframes(props.animation)};
  animation-delay: ${props => props.delay || 0}s;
  animation-fill-mode: both;
`;
const AnimatedButton = styled(Button)`
  animation: 1s ${props => props.animation && getKeyframes(props.animation)};
  animation-delay: ${props => props.delay || 0}s;
  animation-fill-mode: both;
`;
const Animation = styled.span`
  display: inline-block;
  animation: 1s ${props => props.animation && getKeyframes(props.animation)};
  animation-delay: ${props => props.delay || 0}s;
  animation-fill-mode: both;
`;

const slot = props => {
  const { data, overallInterval, key, preview } = props;
  const { src, pingback, srcFile, author } = data?.image || {};
  const hasContent = data.headline?.content || data.richtext?.content || data.text?.content || data.action?.content;
  const Wrap = data.image ? ({ children }) => <Pingback pingback={pingback} origin={pingback && new URL(pingback).origin} src={src}>
    {f => <BackgroundImage
      onLoad={f}
      fluid={srcFile?.childImageSharp?.fluid || {
        src: data?.image?.src,
        aspectRatio: 1
      }}
      backgroundColor={data?.image?.color || "transparent"}
    >
      {children}
    </BackgroundImage>}
  </Pingback> :
  ({ children }) => <Box>{children}</Box>;


  const Animated = memoAnimatedPose(data.image?.entry || "slide-in-left", data.image?.exit || "slide-out-right");
  const getRichtexts = ({
    content,
    content2,
    content3,
    content4,
    content5,
    content6,
    content7,
    content8
  }) => [content,
    content2,
    content3,
    content4,
    content5,
    content6,
    content7,
    content8].filter(i => isString(i));

  return <Animated
    key={key}
  >
    <Wrap>
      <CBox src={data?.image?.content} preview={preview} height={data?.height || 80}>
        {hasContent && <FBox
            left={data.left || "unset"}
            bottom={data.bottom || "unset"}
            right={data.right || "unset"}
            top={data.top || "unset"}
            background={data.boxbackground || "rgba(0,0,0,0.8)"}
            pad={data.pad || "small"}
            a11yTitle={data.a11yTitle}
            border={{
              color: data.borderColor,
              size: data.borderSize,
              style: data.borderStyle,
              side: data.borderSide
            }}
            fill={false}
          >
          {data.headline?.content && <AnimatedHeading delay={data.headline?.delay} animation={data.headline?.animation} level={2} {...data.headline}>
            {data.headline?.content}
          </AnimatedHeading>}
          {data.richtext?.content && !data.richtext?.content2 && <Markdown key="markdown" components={{
            ...components,
            Textflipper,
            Animation,
            AbsBox
          }}>
            {data.richtext?.content}
          </Markdown>}
          {data.richtext?.content &&
            data.richtext?.content2 &&
            <StageContent content={getRichtexts(data.richtext)} interval={data.timing / getRichtexts(data.richtext).length} />}
          {data.text?.content && <AnimatedParagraph delay={data.text?.delay} animation={data.text?.animation} {...data.text}>
            {data.text?.content}
          </AnimatedParagraph>}
          {data.action && data.action?.content && <AnimatedButton as={data.action?.href ? Link : null} delay={data.action?.delay} animation={data.action?.animation} {...data.action} label={data.action?.content} href={data.action?.href ? `${data.action?.href}` : null} to={data.action?.href ? `${data.action?.href}` : null}/>}
        </FBox>}
      </CBox>
    </Wrap>
    <Attribution author={author} app_name={location.origin} />
  </Animated>;
};

export class StageContent extends React.PureComponent<Props> {

  static defaultProps = {
    content: [],
    interval: 2000
  }

  private state = { slot: 0 };

  public componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({
        slot: (this.state.slot + 1) % this.props.content.length
      });
    }, this.props.interval);
  }

  public componentWillUnmount() {
    clearInterval(this.interval);
  }

  public render() {
    const { content } = this.props;
    if(content.length === 0) return null;
    if(content.length === 1) return content[0];
    const Animated = posed.div(mergeDeepRight(inAnimations["fade-in"], outAnimations["fade-out"]));
    return (<PoseGroup
        animateOnMount
        preEnterPose="from"
        enterPose="enter"
        exitPose="exit"
        flipMove={false}
      >
        <Animated key={this.state.slot}>
          <Markdown key="markdown" components={{
            ...components,
            Textflipper,
            Animation,
            AbsBox
          }}>
            {content[this.state.slot]}
          </Markdown>
        </Animated>
      </PoseGroup>);
  }
}



export class Stage extends React.PureComponent<Props> {

  public constructor(props) {
    super(props);
    this.state = { timePassed: 0, visible: true };
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  static defaultProps = {
    slides: [],
    defaultTiming: 8000
  }

  public componentDidMount() {
    const slots = this.props.slides;
    const slides = Array.isArray(slots) ? slots : Object.values(slots);
    const minimumTime = slides.length > 1 ?
      gcd(...slides.map(i => i.timing || this.props.defaultTiming)) :
      Number.MAX_SAFE_INTEGER;
    const totalTime = slides.reduce((p, i) => p + (i.timing || this.props.defaultTiming), 0);
    this.interval = setInterval(() => {
      this.setState({
        timePassed: (this.state.timePassed + minimumTime) % totalTime
      });
    }, minimumTime);
  }

  public componentWillUnmount() {
    clearInterval(this.interval);
  }

  private getTimeSlots(slots, timePassed, defaultTiming) {
    const [timeSlots, totalTime] = slots.slice().reduce(([p, timePassed], { timing = defaultTiming }, idx) => [
      p.concat([{ idx, timePassed }]),
      timePassed + timing
    ], [[], 0]);

    const filteredTimeSlots = timeSlots.filter(i => i.timePassed <= timePassed);
    if(!filteredTimeSlots.length) {
      return 0;
    }
    return filteredTimeSlots.pop().idx;
  }

  public shouldComponentUpdate(nextProps, nextState) {
    const { slides, defaultTiming } = this.props;
    const slots = Array.isArray(slides) ? slides : Object.values(slides);
    const nextPropsslots = Array.isArray(nextProps.slides) ? nextProps.slides : Object.values(nextProps.slides);

    const currentSlotIdx = this.getTimeSlots(slots, this.state.timePassed, defaultTiming);
    const nextSlotIdx = this.getTimeSlots(nextPropsslots, nextState.timePassed, nextProps.defaultTiming);
    // If the model has updated, update the view
    if(nextProps._modified !== this.props._modified) return true;
    return nextState.visible && currentSlotIdx !== nextSlotIdx;
  }

  private handleVisibilityChange(event) {
    this.setState({
      visible: event.isIntersecting
    });
  };

  public render() {
    const { slides, defaultTiming, preview } = this.props;
    const slots = Array.isArray(slides) ? slides : Object.values(slides);
    console.log("slides", slots, slots[0]);
    if(slots.length === 0) return null;
    if(slots.length === 1) return (<ImgBox key="RBox">
      {slot({ preview, data: slots[0], key: 0 })}
      <CBox key="placeholder" preview={preview} height={slots[0].height || 80}/>
    </ImgBox>)
    // const slotsels = slots.map((i, idx) => slot({ data: i, key: idx }));
    const currentSlotIdx = this.getTimeSlots(slots, this.state.timePassed, defaultTiming);
    const current = slots[currentSlotIdx];
    return (
      <ImgBox>
          <PoseGroup
            animateOnMount
            preEnterPose="from"
            enterPose="enter"
            exitPose="exit"
            flipMove={false}
          >
            {slot({ preview, data: current, key: currentSlotIdx })}
            <Observer key="placeholder" onChange={this.handleVisibilityChange}>
              <CBox key="placeholder" preview={preview} height={current.height || 80}/>
            </Observer>
          </PoseGroup>
      </ImgBox>
    );
  }
}
