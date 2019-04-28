import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { StaticQuery, graphql } from 'gatsby';
import { Anchor } from 'grommet';

const Initiale = styled.span`
  position: absolute;
  font-size: 7rem;
  transform: translate(-50%, -50%);
  opacity: 0.08;
  user-select: none;
  z-index: -1;
`;

interface Props {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  timeToRead: number;
  category: string;
}

export class Teaser extends React.PureComponent<Props> {
  public render() {
    const {} = this.props;

    return (
      <div>
        <h1>yay</h1>
        <StaticQuery
          query={graphql`
            query {
              data {
                componentpicture(_id: "5cc44f13fcdecd00049f3a03") {
                  _client
                  title
                  src
                  srcFile {
                    id
                    relativePath
                    childImageSharp {
                      fluid(maxWidth: 700) {
                        ...GatsbyImageSharpFluid_withWebp
                      }
                    }
                  }
                }
              }
            }
          `}
          render={data => (
            <header>
              <Img fluid={data.data.componentpicture.srcFile.childImageSharp.fluid} onLoad={
                () => fetch(data.data.componentpicture.src, {
                  redirect: "manual",
                  referrer: "no-referrer",
                  credentials: "omit",
                  cache: "no-cache"
                })
              } />
              <p>{data.data.componentpicture.title}</p>
              <p>ToDo: ping {data.data.componentpicture.src}</p>
            </header>
          )}
        />
      </div>
    );
  }
}
