import React from 'react';
import styled from 'styled-components';
import { Anchor, Box, Grid, ResponsiveContext, SkipLinks, SkipLink, SkipLinkTarget } from 'grommet';
import { mq } from '../utils/media';

import { ThemeContext } from 'styled-components';

import { Stage } from "../Widget"; // Deleteme

const Main = ({ children, value }) => {
  const MMain = styled.main`
    position: relative;
    padding: 0;
    ${mq('small')(`
     padding: 0 calc( 100vw - ${props => props.theme.global.size.xxlarge} / 2 );
    `)}
  `;
  return (<ThemeContext.Consumer>
      {theme => (
        <MMain theme={theme}>
          {children}
        </MMain>
      )}
    </ThemeContext.Consumer>);
}

/* Convert to dynamic */
const slots = [
  {
    height: 100,
    left: "3rem",
    bottom: "3rem",
    right: "3rem",
    top: null,
    boxbackground: "rgba(0,0,0,0.8)",
    pad: "large",
    timing: 2000,
    boxbackground: "red",
    image: {
      color: "#017956",
      src: "https://via.placeholder.com/1200x800.png",
      entry: "fade-in",
      exit: "fade-out",
      tags: [],
      location: {
        city: "",
        country: ""
      },
      author: {
        name: "",
        portfolio_url: "",
        profileurl: "",
        username: "",
        plattform: "",
        plattformname: "",
      },
      alt: "",
      width: 150,
      height: 150
    },
    headline: {
      content: "Welcome!",
      animation: "jello"
    },
    richtext: {
      content: "I am Jannes",
      animation: "zoomInLeft",
      delay: 0.5
    },
    action: {
      content: "Click Me!",
      fill: true,
      animation: "tada",
      delay: 3
    }
  },
  {
    height: 70,
    top: "0",
    bottom: "0",
    right: "0",
    left: "0",
    boxbackground: "transparent",
    pad: "large",
    timing: 6000,
    image: {
      src: "https://images.unsplash.com/photo-1480497490787-505ec076689f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
    },
    headline: {
      content: "Headline",
      animation: "zoomIn",
      delay: 0.1
    },
    richtext: {
      content: 'Lorem Ipsum trallalalala! <Animation animation="tada">Some animated text</Animation>',
      content2: '<Animation animation="tada">Buy now!!</Animation>',
      content3: '<AbsBox bottom="3rem" right="3rem" pad="3rem" round background="brand"><Animation animation="tada">Yes, now!!</Animation></AbsBox>',
      content4: '<Animation animation="tada">Buy!!!!!</Animation>'
    }
  },
  {
    left: "3rem",
    bottom: "3rem",
    right: "3rem",
    top: "10rem",
    boxbackground: "rgba(0,0,0,0.3)",
    pad: "xsmall",
    timing: 1000,
    image: {
      src: "https://images.unsplash.com/photo-1501030834146-c0b1914e72be?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    },
    text: {
      content: "Some text!!!",
      size: "small",
      textAlign: "center",
      alignSelf: "end",
      animation: "fadeInUp"
    }
  },
  {
    image: {
      src: "https://images.unsplash.com/photo-1494253188410-ff0cdea5499e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    },
    text: {
      content: "Yes! Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      animation: "rotateInDownLeft",
      delay: 2
    },
    action: {
      content: "2!",
      alignSelf: "end",
      animation: "zoomOutDown"
    }
  }
];

export const ModernLayout = (props) => {
  return (<>
    <Grid
      as="header"
      rows={['full']}
      columns={['auto', 'flex', 'auto']}
      areas={[
        { name: 'left', start: [0, 0], end: [1, 0] },
        { name: 'center', start: [1, 0], end: [2, 0] },
        { name: 'right', start: [2, 0], end: [3, 0] },
      ]}
    >
      <SkipLinkTarget id="header" />
      <Box gridArea="left" background="brand">
        {props.__renderSubtree(props?.header?.left)}
      </Box>
      <Box gridArea="center" background="brand">
        {props.__renderSubtree(props?.header?.center)}
      </Box>
      <Box gridArea="right" background="brand">
        {props.__renderSubtree(props?.header?.right)}
      </Box>
    </Grid>
    <Main>
      <SkipLinkTarget id="main" />
      <Box direction="column">
        {props.__renderSubtree(props?.main)}
      </Box>
    </Main>
    <Grid
      as="footer"
      rows={['full']}
      columns={['auto', 'flex', 'auto']}
      areas={[
        { name: 'left', start: [0, 0], end: [1, 0] },
        { name: 'center', start: [1, 0], end: [2, 0] },
        { name: 'right', start: [2, 0], end: [3, 0] },
      ]}
    >
      <SkipLinkTarget id="footer" />
      <Box gridArea="left" background="brand">
        {props.__renderSubtree(props?.footer?.left)}
      </Box>
      <Box gridArea="center" background="brand">
        {props.__renderSubtree(props?.footer?.center)}
      </Box>
      <Box gridArea="right" background="brand">
        {props.__renderSubtree(props?.footer?.right)}
      </Box>
    </Grid>
  </>)
}
