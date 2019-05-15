import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { Markdown, Paragraph, Anchor, Box } from 'grommet';
import Image from 'react-shimmer';
import LazyLoad from 'react-lazyload';

interface Props {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  timeToRead: number;
  category: string;
  gridArea: string;
}

const newline = `\n`;

export class RichText extends React.PureComponent<Props> {
  public render() {
    const { markdown, urlescaped, escaped, b64, gridArea } = this.props;

    // encode = window.btoa(unescape(encodeURIComponent(str)))
    // decode = decodeURIComponent(escape(window.atob(b64)));
    const pipeline = [[b64, window.atob], [escaped, window.escape], [urlescaped, window.decodeURIComponent]]
      .filter(([t]) => t === true)
      .map(([__, f]) => f)
      .reduce((p, f) => x => f(p(x)), x => x);

    const components = {
      a: {
        component: props => {
          console.log(props);
          const MDLink = styled(Link)``;
          return <Anchor {...props} as={MDLink} href={props.href} to={props.href} />;
        },
      },
      img: {
        component: props => {
          return (
            <LazyLoad height={200} once offset={100}>
              <Image {...props} width={250} height={100} />
            </LazyLoad>
          );
        },
      },
    };
    return (<Box gridArea={gridArea}>
      <Markdown components={components}>
        {pipeline(markdown || "")}
      </Markdown>
    </Box>);
  }
}
