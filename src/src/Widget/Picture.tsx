import React from 'react';
import styled from 'styled-components';
import { tryCatch } from "ramda";
import Img from 'gatsby-image';
import { Anchor, Box, Text } from 'grommet';
import { noop } from 'ramda-adjunct';
import { Location } from '@reach/router';
import { PriorityContext, IMPORTANT, LOW } from "../utils/priorityContext";

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
  font-size: small;
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
  transition: opacity 0.1s, background 0.1s;
  padding: 1rem;
  pointer-events: none;
  color: #CCC;
  ${ImgBox}:hover > &, &:hover {
    opacity: 1;
  }
`;
const BGBox = styled.span`
  font-size: 0.8em;
  background: rgba(0,0,0,0.4);
  padding: 0.05em;
`;
export const Attribution = ({ author, app_name }) => {
  const profileurl = `${author?.profileurl}?utm_source=${app_name}&utm_medium=referral`;
  const plattformurl = `${author?.plattform}/?utm_source=${app_name}&utm_medium=referral`;
  return <>{author?.profileurl && <Attributionoverlay aria-label={`Photo by ${author?.name} on ${author?.plattformname}`}>
  <BGBox aria-hidden>
    <span>Photo&nbsp;by&nbsp;</span>
    <Anchor color="inherit" href={profileurl}>{author?.name}</Anchor>
    <span>&nbsp;on&nbsp;</span>
    <Anchor color="inherit" href={plattformurl}>{author?.plattformname}</Anchor>
  </BGBox>
  </Attributionoverlay>}</>;
};

export const Pingback = ({ children, pingback = "", origin, src = "" }) =>
  (<Location>
    {({ location }) => {
      const f =
        pingback && location.origin !== origin
          ? () => window.requestIdleCallback(() => {
            return window.setTimeout(() => {
              const img = document.createElement("img");
              const suffix = (pingback === true ? src : pingback).indexOf("?") > 1 ? "&auto=format&w=1&h=1" : "?auto=format&w=1&h=1";
              img.decoding = "async";
              img.src = pingback === true ? `${src}${suffix}` : `${pingback}${suffix}`;
              img.referrerpolicy = "origin-when-cross-origin";
              img.hidden = true;
              img.style.display = "none";
              document.body.appendChild(img);
              window.setTimeout(() => img.parentElement.removeChild(img), 10);
            }, 2000)
          })
          : noop;
      return children(f);
    }}
  </Location>);

export class Picture extends React.PureComponent<Props> {

  static defaultProps = {
    tags: [],
    src: "",
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

  static contextType = PriorityContext

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
    const { _id, className, pingback, src, alt, title, crossorigin, color, gridArea, srcFile, preview, author } = this.props;
    const app_name = typeof location !== 'undefined' && location && location.origin; // not defined in SSR
    if(process.env.NODE_ENV === "development" && preview) {
      if(!this?.state?.width || !this?.state?.height) {
        return <span className={className}>Loading</span>
      }
      const priority = this.context;
      return <ImgBox className={className} background={color} fill gridArea={gridArea}>
        <Img
          critical={priority === IMPORTANT}
          loading={priority === IMPORTANT ? "eager" : "lazy"}
          decoding={priority === IMPORTANT ? "sync" : "async"}
          importance={priority === IMPORTANT ? "high" : (priority === LOW ? "low" : "auto")}
          id={_id}
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
    const newUrl = tryCatch(url => new URL(src), u => ({ origin: u }));
    const oorig = newUrl(src).origin;
    if (!srcFile?.childImageSharp) {
      return <Text id={_id} className={className} gridArea={gridArea}>Image rendering failed</Text>;
    }
    return (
      <Pingback origin={oorig} pingback={pingback} src={src}>
        {(f) => {
          return (
            <ImgBox className={className} background={color} fill gridArea={gridArea}>
              <Img
                id={_id}
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
      </Pingback>
    );
  }
}
