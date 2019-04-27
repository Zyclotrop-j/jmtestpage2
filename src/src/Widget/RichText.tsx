import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from "gatsby-image";
import { Markdown, Paragraph, Anchor } from 'grommet';

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

const text = `## Grommet **heart**s markdown

Favorite thing, [link](https://twitter.com/grommet_io)`;

export class RichText extends React.PureComponent<Props> {
  public render() {
    const { markdown, optimisedImages } = this.props;

    const components = {
      "a": {
        "component": (props) => {
          console.log(props);
          const MDLink = styled(Link)``;
          return <Anchor {...props} as={MDLink} href={props.href} to={props.href} />;
        }
      },
      "img": {
        "component": props => {
          optimisedImages

        }
      }
    };

    return (
      <Markdown components={components}>{text}</Markdown>
    );
  }
}
