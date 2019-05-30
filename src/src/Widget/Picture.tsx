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

export const uiSchema = {
  "ui:field": "attributedpicture"
};

export const ImgBox = styled(Box)`
  position: relative;
`;
const Attributionoverlay = styled.div`
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  text-align: right;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.1s;
  padding: 1rem;
  ${ImgBox}:hover > & {
    opacity: 1;
  }
`;
export const Attribution = ({ author, app_name }) => {
  const profileurl = `${author?.profileurl}?utm_source=${app_name}&utm_medium=referral`;
  const plattformurl = `${author?.plattform}/?utm_source=${app_name}&utm_medium=referral`;
  return <>{author?.profileurl && <Attributionoverlay>
  <span>By&nbsp;</span>
  <Anchor color="inherit" href={profileurl}>{author?.name}</Anchor>
  <span>&nbsp;on&nbsp;</span>
  <Anchor color="inherit" href={plattformurl}>{author?.plattformname}</Anchor>
  </Attributionoverlay>}</>;
};

export class Picture extends React.PureComponent<Props> {

  static defaultProps = {
    tags: [],
    src: "https://via.placeholder.com/150",
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
  }

  public componentDidMount() {
    if(process.env.NODE_ENV === "development" && this.props.preview) {
      function getMeta(url){
          return new Promise((res, rej) => {
            const img = new Image();
            img.decoding = "async";
            img.addEventListener("load", function(){
                res({
                  width: this.naturalWidth, height: this.naturalHeight
                });
            });
            img.addEventListener("error", () => {
              // Something went wrong, like CORS
              // Pretend everything went alright
              res({
                width: 100, height: 100
              });
            });
            img.src = url;
          });
      }
      getMeta(this.props.src).then(i => this.setState(i));
    }
  }

  public render() {
    // // TODO: Put pingback in schema
    const { pingback, src, alt, title, crossorigin, color, gridArea, srcFile, preview, author } = this.props;
    const app_name = location.origin;
    if(process.env.NODE_ENV === "development" && preview) {
      if(!this?.state?.width || !this?.state?.height) {
        return <span>Loading</span>
      }
      return <ImgBox background={color} fill gridArea={gridArea}>
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
        <Attribution author={author} app_name={app_name} />
      </ImgBox>
    }
    const oorig = new URL(src).origin;
    if (!srcFile?.childImageSharp) {
      return <Text gridArea={gridArea}>Image rendering failed</Text>;
    }
    return (
      <Location>
        {({ location }) => {
          const f =
            pingback && location.origin.origin !== oorig
              ? () => {
                const img = document.createElement("img");
                img.decoding = "async";
                img.src = src;
                img.referrerpolicy = "origin-when-cross-origin";
                img.hidden = true;
                img.style.display = "none";
                document.body.appendChild(img);
                window.setTimeout(() => img.parentElement.removeChild(img), 10);
              }
              : noop;
          return (
            <ImgBox background={color} fill gridArea={gridArea}>
              <Img
                fluid={srcFile.childImageSharp.fluid}
                alt={alt}
                title={title}
                crossOrigin={crossorigin}
                backgroundColor={color}
                onLoad={f}
              />
              <Attribution author={author} app_name={app_name} />
            </ImgBox>
          );
        }}
      </Location>
    );
  }
}
