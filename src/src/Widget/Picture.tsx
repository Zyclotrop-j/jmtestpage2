import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { Anchor, Box, Text } from 'grommet';
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

  public componentDidMount() {
    if(process.env.NODE_ENV === "development" && this.props.preview) {
      function getMeta(url){
          return new Promise((res, rej) => {
            const img = new Image();
            img.addEventListener("load", function(){
                res({
                  width: this.naturalWidth, height: this.naturalHeight
                });
            });
            img.addEventListener("error", rej);
            img.src = url;
          });
      }
      getMeta(this.props.src).then(i => this.setState(i));
    }
  }

  public render() {
    const { src, alt, title, crossorigin, color, gridArea, srcFile, preview } = this.props;
    if(process.env.NODE_ENV === "development" && preview) {
      if(!this?.state?.width || !this?.state?.height) {
        return <span>Loading</span>
      }
      return <Box fill gridArea={gridArea}>
        <Img
          fluid={{
            src,
            aspectRatio: this.state.width / this.state.height
          }}
          alt={alt}
          title={title}
          crossOrigin={crossorigin}
          backgroundColor={color}
        />
      </Box>
    }
    const oorig = new URL(src).origin;
    if (!srcFile?.childImageSharp) {
      return <Text gridArea={gridArea}>Image rendering failed</Text>;
    }
    return (
      <Location>
        {({ location }) => {
          const f =
            location.origin.origin !== oorig
              ? () => {
                const img = document.createElement("img");
                img.src = src;
                img.hidden = true;
                img.style.display = "none";
                document.body.appendChild(img);
                window.setTimeout(() => img.parentElement.removeChild(img), 10);
              }
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
