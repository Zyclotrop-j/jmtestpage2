import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { Box as GBox } from 'grommet';
import { map } from 'ramda';

interface Props {}

export class Group extends React.PureComponent<Props> {

  static defaultProps = {
    components: []
  }

  public render() {
    const {
      __children: { children = [] },
      __renderSubtree,
    } = this.props;
    const content = children.reduce(
      (p, u, idx) => p.concat(u.map(__renderSubtree)), []
    );
    return (<>{content}</>);
  }
}
