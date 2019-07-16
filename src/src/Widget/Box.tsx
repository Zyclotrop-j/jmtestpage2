import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { map } from 'ramda';
import BackgroundImage from 'gatsby-background-image';
import { Attribution, Pingback, ImgBox } from "./Picture";
import { HeadlineContext } from "../utils/headlineContext";
import { PriorityContext, IMPORTANT, LOW } from "../utils/priorityContext";

interface Props {
  b64: boolean;
  urlescaped: boolean;
  text: string;
}

export const uiSchema = {
  background: {
    "ui:field": "attributedpicture"
  }
};

export class Box extends React.PureComponent<Props> {

  static contextType = HeadlineContext;

  static defaultProps = {
    content: "",
    background: {
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
      height: 150,
      advanced: {
        fill: false
      }
    }
  }

  public render() {
    const {
      _id,
      advanced: { align, alignContent, alignSelf, fill, justify, basis, flex, overflow, responsive, height, width } = {},
      animation,
      background: { srcFile, pingback, src, ...background },
      border,
      direction,
      elevation,
      gap,
      margin,
      pad,
      round,
      wrap,
      gridArea,
      __children: { child = [] },
      __renderSubtree,
      className,
    } = this.props;
    const { color: bcolor, side: bside, size: bsize, style: bstyle } = border || {};

    const content = child.map(__renderSubtree);

    const t = x =>
      ({
        half: '1/2',
        third: '1/3',
        twothird: '2/3',
        quarter: '1/4',
        twoquarter: '2/4',
        threequarter: '3/4',
      }[x] || x);

    const corner = round ? round.corner : round;

    // Funny enough, when properties are null and not undefined, grommet is crashing :(
    const obj = map(x => x === null ? undefined : x, {
      align: align && align.toLowerCase(),
      alignContent,
      alignSelf,
      fill,
      justify,
      flex,
      overflow,
      responsive,
      height,
      width,
      animation,
      border: { color: bcolor?.toLowerCase(), side: bside?.toLowerCase(), size: bsize?.toLowerCase(), style: bstyle?.toLowerCase() },
      elevation,
      gap,
      margin,
      pad,
      wrap,
    });

    const hasImageSharp = srcFile?.childImageSharp;
    const Wrap = ({ children }) => hasImageSharp ?
      <Pingback pingback={pingback} origin={pingback && new URL(pingback).origin} src={src}>
        {f =>
          <PriorityContext.Consumer>
          {priority => <BackgroundImage
            critical={priority === IMPORTANT}
            loading={priority === IMPORTANT ? "eager" : "lazy"}
            decoding={priority === IMPORTANT ? "sync" : "async"}
            importance={priority === IMPORTANT ? "high" : (priority === LOW ? "low" : "auto")}
            id={_id} className={className} onLoad={f} {...background} fluid={srcFile.childImageSharp.fluid} backgroundColor={background.color}>
            {children}
          </BackgroundImage>}
          </PriorityContext.Consumer>
        }
      </Pingback> :
      <>{children}</>;

    const app_name = typeof location !== 'undefined' && location && location.origin; // not defined in SSR
    return (<HeadlineContext.Provider value={this.context + 1}>
      <Wrap>
        <ImgBox
          {...obj}
          className={!hasImageSharp && className}
          background={hasImageSharp ? null : {
            ...background,
            image: background.image ? `url(${background.image})` : ""
          }}
          pad={background?.author?.profileurl ? {
            ...pad,
            bottom: `calc( 3rem + ${pad.bottom !== "none" ? pad.bottom || "0px" : "0px"} );`
          } : pad}
          direction={
            {
              row: 'row',
              column: 'column',
              rowresponsive: 'row-responsive',
              rowreverse: 'row-reverse',
              columnreverse: 'column-reverse',
            }[direction]
          }
          round={{
            ...round,
            corner: {
              top: 'top',
              left: 'left',
              bottom: 'bottom',
              right: 'right',
              topleft: 'top-left',
              topright: 'top-right',
              bottomleft: 'bottom-left',
              bottomright: 'bottom-right',
            }[corner],
          }}
          basis={t(basis)}
          gridArea={gridArea}
        >
          <Attribution author={background.author} app_name={app_name} />
          {content}
        </ImgBox>
      </Wrap>
    </HeadlineContext.Provider>);
  }
}
