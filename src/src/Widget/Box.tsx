import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { Box as GBox } from 'grommet';
import { map } from 'ramda';

interface Props {
  b64: boolean;
  urlescaped: boolean;
  text: string;
}

export class Box extends React.PureComponent<Props> {

  static defaultProps = {
    
  }

  public render() {
    const {
      advanced: { align, alignContent, alignSelf, fill, justify, basis, flex, overflow, responsive, height, width } = {},
      animation,
      background,
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
    } = this.props;

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

    const obj = {
      align,
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
      background,
      border,
      elevation,
      gap,
      margin,
      pad,
      wrap,
    };

    return (
      <GBox
        {...map(v => (v === null ? undefined : v), obj)}
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
        {content}
      </GBox>
    );
  }
}
