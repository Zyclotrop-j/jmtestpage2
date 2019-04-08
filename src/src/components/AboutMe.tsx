import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import { position } from 'polished';
import { Spring, Transition, animated } from 'react-spring/renderprops';
import { Anchor, Heading, Text } from 'grommet';
// import { interpolate } from 'flubber';

import { Subline } from './Subline';

const Fold = styled.div`
  padding: 1rem;
  height: 90px;
  i:before {
    transition: transform 0.3s;
  }
  &:hover i:before {
    transform: rotate(135deg) scale(1.4);
  }
`;

const Card = animated(styled.div`
  cursor: pointer;
`);

const InnerCard = animated(styled.div`
  box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.5);
  }
  border-radius: 5px;
`);

const DropIcon = styled.i`
  position: absolute;
  right: 25px;
  bottom: 30px;
  &:before {
    content: '';
    position: absolute;
    left: -5px;
    top: 3px;
    width: 10px;
    height: 10px;
    border-top: solid 1px currentColor;
    border-right: solid 1px currentColor;
    -webkit-transform: rotate(135deg);
    transform: rotate(135deg);
  }
`;

const StyledAnchor = styled(Anchor)`
  color: ${props => props.color};
  transition: padding-left ${props => props.theme.global.transitionDuration} 0.3s;
  position: relative;
  &:hover {
    transition: padding-left ${props => props.theme.global.transitionDuration} 0s;
    padding-left: 1.5rem;
  }
`;

const SSvg = styled.svg`
  position: absolute;
  display: inline-block;
  width: 20px;
  left: 0;
  g {
    fill: none;
    stroke-width: 2;
    stroke: transparent;
  }
  ${StyledAnchor}:hover & g {
    stroke: black;
  }
`;

const hide = { opacity: 0 };
const show = { opacity: 1 };

export class AboutMe extends React.PureComponent<Props> {
  public constructor(props) {
    super(props);
    this.state = {
      flipped: false,
      paths: [
        'M19,5 L21,5 L21,3 L19,3 L19,5 Z M11,5 L13,5 L13,3 L11,3 L11,5 Z M3,5 L5,5 L5,3 L3,3 L3,5 Z M19,13 L21,13 L21,11 L19,11 L19,13 Z M11,13 L13,13 L13,11 L11,11 L11,13 Z M3,13 L5,13 L5,11 L3,11 L3,13 Z M19,21 L21,21 L21,19 L19,19 L19,21 Z M11,21 L13,21 L13,19 L11,19 L11,21 Z M3,21 L5,21 L5,19 L3,19 L3,21 Z',
        'M5,6 L1,4.5 L1,18.443038 L12,23 L23,18.443038 L23,4 L19,6 M5,16 L5,2 L12,5 L19,2 L19,16 L12,19 L5,16 Z M11.95,5 L11.95,19',
        'M9,7 L9,1 L23,1 L23,11 L20,11 L20,16 L15,12 M1,7 L15,7 L15,18 L9,18 L4,22 L4,18 L1,18 L1,7 Z',
        'M1,1 L23,1 L23,23 L1,23 L1,1 Z M1,5 L23,5 M5,1 L5,5 M11,16 L19,16 M5,10 L8,13 L5,16',
        'M8,9 L16,9 L16,1 L8,1 L8,9 Z M1,23 L9,23 L9,15 L1,15 L1,23 Z M15,23 L23,23 L23,15 L15,15 L15,23 Z M5,15 L8,9 L5,15 Z M10,19 L14,19 L10,19 Z M16,9 L19,15 L16,9 Z',
        'M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7',
        'M13,20 C19,19 21,14 21,10 M14,16 L12,20 L16,23 M0,9 L4,6 L7,10 M9.00000008,20 C3,17 2.00000006,12 3.99999998,6 M20,6.99999999 C16,0.99999995 10,1 6,4.00609254 M20,2 L20,7 L15,7',
        'M12,2 L22,7 L22,17 L12,22 L2,17 L2,7 L12,2 Z M2,7 L12,12 L22,7 M12,12 L12,21.9999998 L12,12 Z',
        'M23,1 C23,1 16.471872,0.541707069 14,3 C13.9767216,3.03685748 10,7 10,7 L5,8 L2,10 L10,14 L14,22 L16,19 L17,14 C17,14 20.9631426,10.0232786 21,10 C23.4582929,7.5281282 23,1 23,1 Z M17,8 C16.4475,8 16,7.5525 16,7 C16,6.4475 16.4475,6 17,6 C17.5525,6 18,6.4475 18,7 C18,7.5525 17.5525,8 17,8 Z M7,17 C6,16 4,16 3,17 C2,18 2,22 2,22 C2,22 6,22 7,21 C8,20 8,18 7,17 Z',
        'M15,17.0002864 C15,14.0000003 19,12.0005727 19,8.00028636 C19,4.00000002 16,1.00028636 12,1.00028636 C8,1.00028636 5,4.00000002 5,8.00028636 C5,12.0005727 9,14.0000003 9,17.0002864 C9,20.0005725 9,20 9,20 C9,22.0000003 10,22.9999997 12,23 C14,23.0000003 15,22.0000003 15,20 C15,20 15,20.0005725 15,17.0002864 Z M9,18 L15,18',

        // 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
        // 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
        // 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
        // 'M7 2v11h3v9l7-12h-4l4-8z',
        // 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
      ],
      index: 0,
    };
    this.flip = this.flip.bind(this);
    this.goNext = this.goNext.bind(this);
  }

  public render() {
    const { flipped, paths, index } = this.state;
    // const interpolator = interpolate(paths[index], paths[index + 1] || paths[0], { maxSegmentLength: 0.1 });
    return (
      <div>
        <Heading level={2}>About Me</Heading>
        <Spring native to={{ transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)` }}>
          {props => (
            <Card onClick={this.flip} style={props}>
              <Transition native unique items={flipped} from={hide} enter={show} leave={hide}>
                {flippedd => ({ opacity }) => {
                  const opa = opacity.interpolate({ range: [0, 0.5, 1], output: [0, 0, 1] });
                  return (
                    <InnerCard
                      flipped={flippedd}
                      style={{
                        transform: `rotateX(${flippedd ? 180 : 0}deg)`,
                        opacity: opa,
                        position: opa.interpolate(o => (!o ? 'absolute' : 'relative')),
                      }}
                    >
                      {flippedd ? (
                        <Fold className="me">
                          My colleagues call me “Mr Web”, “lodash” and “the brain” - at work I take care of our frontend including the
                          API-design and connection.
                          <DropIcon />
                        </Fold>
                      ) : (
                        <Fold className="me">
                          In my free time, I build IoT-applications, websites, home-automation and{' '}
                          <StyledAnchor as={Link} to="/meet" color="inherit">
                            <Text interactive as="span" size="inherit" underline underlineColor="color-secondary-1-0">
                              <SSvg viewBox="0 0 24 24">
                                <g>
                                  <Transition native unique items={paths[index]} from={hide} enter={show} leave={hide} onRest={this.goNext}>
                                    {path => ({ opacity: opacityy }) =>
                                      React.createElement(animated.path, { d: path, style: { opacity: opacityy } })}
                                  </Transition>
                                </g>
                              </SSvg>
                              other cool things
                            </Text>
                          </StyledAnchor>{' '}
                          – everything included, from soldering the circuits to exposing the functionality as a web application.
                          <DropIcon />
                        </Fold>
                      )}
                    </InnerCard>
                  );
                }}
              </Transition>
            </Card>
          )}
        </Spring>
      </div>
    );
  }

  private flip() {
    this.setState({ flipped: !this.state.flipped });
  }
  private goNext = () => {
    if (this.goNextTimeout) {
      window.clearTimeout(this.goNextTimeout);
    }
    this.goNextTimeout = window.setTimeout(() => {
      this.setState(state => ({ index: state.index + 1 >= state.paths.length ? 0 : state.index + 1 }));
    }, 1000);
  };
}
