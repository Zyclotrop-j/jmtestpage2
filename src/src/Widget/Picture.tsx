import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { Anchor, Box } from 'grommet';
import { noop } from 'ramda-adjunct';
import { Location } from '@reach/router';

interface Props {
  src: string;
  alt: string;
  title: string;
  crossorigin: string;
  color: number;
  gridArea: string;
  fluid: object | undefined;
}

export class Picture extends React.PureComponent<Props> {
  public render() {
    const { src, alt, title, crossorigin, color, gridArea, srcFile } = this.props;
    const oorig = new URL(src).origin;
    if (!srcFile.childImageSharp) return 'Image rendering failed';
    return (
      <Location>
        {({ location }) => {
          const f =
            location.origin.origin !== oorig
              ? () =>
                  fetch(src, {
                    redirect: 'manual',
                    referrer: 'no-referrer',
                    credentials: 'omit',
                    cache: 'no-cache',
                  })
              : noop;
          return (
            <Box fill gridArea={gridArea}>
              <Img
                fluid={srcFile.childImageSharp.fluid}
                alt={alt}
                title={title}
                crossOrigin={crossorigin}
                backgroundColor={color}
                onLoad={f}
              />
            </Box>
          );
        }}
      </Location>
    );
  }
}
