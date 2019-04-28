import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from "gatsby-image";
import { StaticQuery, graphql } from "gatsby"
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
    const {  } = this.props;

    return (
      <div>
      <h1>yay</h1>
      <StaticQuery
        query={graphql`
          query {
            data {
              componentpictures {
                title
                src
                srcFile {
                  id
                  relativePath
                  childImageSharp {
                    fixed(width: 500, height: 250) {
                      ...GatsbyImageSharpFixed
                    }
                  }
                }
              }
            }
          }

        `}
        render={data => (<header>
            <Img fixed={data.data.componentpictures[0].srcFile.childImageSharp.fixed} />
            <p>{data.data.componentpictures[0].title}</p>
          </header>)
        }
      />
      </div>
    );
  }
}
