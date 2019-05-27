import React from 'react';
import styled from 'styled-components';
import { Anchor, Box, Grid, ResponsiveContext, SkipLinks, SkipLink, SkipLinkTarget } from 'grommet';
import { mq } from '../utils/media';

import { ThemeContext } from 'styled-components';

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
      <Box direction="column">{props.__renderSubtree(props?.main)}</Box>
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
