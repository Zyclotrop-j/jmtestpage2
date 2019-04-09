import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import { Anchor } from 'grommet';
import Post from '../models/Post';

const Wrapper = styled.div`
  display: flex;
  margin: 6rem auto 0 auto;
  a {
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
  }
  justify-items: center;
`;

const Prev = styled.div`
  span {
    text-transform: uppercase;
    font-size: 0.8rem;
    color: ${props => props.theme.colors.grey.light};
  }
`;

const Next = styled.div`
  margin-left: auto;
  text-align: right;
  span {
    text-transform: uppercase;
    font-size: 0.8rem;
    color: ${props => props.theme.colors.grey.light};
  }
`;

interface Props {
  next: Post;
  prev: Post;
}

export class PrevNext extends React.PureComponent<Props> {
  public render() {
    const { prev, next } = this.props;
    return (
      <Wrapper>
        {prev && (
          <Prev>
            <span>Previous</span>
            <Anchor
              as={Link}
              href={`/blog/${kebabCase(prev.frontmatter.title)}`}
              to={`/blog/${kebabCase(prev.frontmatter.title)}`}
              state={{ direction: 'left' }}
            >
              {prev.frontmatter.title}
            </Anchor>
          </Prev>
        )}
        {next && (
          <Next>
            <span>Next</span>
            <Anchor
              as={Link}
              href={`/blog/${kebabCase(next.frontmatter.title)}`}
              to={`/blog/${kebabCase(next.frontmatter.title)}`}
              state={{ direction: 'right' }}
            >
              {next.frontmatter.title}
            </Anchor>
          </Next>
        )}
      </Wrapper>
    );
  }
}
