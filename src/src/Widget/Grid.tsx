import React from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { Grid as GGrid, ResponsiveContext, Box } from 'grommet';
import { range, always } from 'ramda';
import { renameKeysWith } from 'ramda-adjunct';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { HeadlineContext } from "../utils/headlineContext";

interface Props {
  b64: boolean;
  urlescaped: boolean;
  text: string;
}

const alwaysauto = always("auto");

export class Grid extends React.PureComponent<Props> {

  static contextType = HeadlineContext;

  static defaultProps = {
      content: [],
      columns: [],
      advanced: {
        fill: false
      }
  }

  state = { isSmall: typeof window !== 'undefined' ? window.matchMedia(`(max-width: 768px)`).matches : true }

  componentDidMount() {
    const smallbreakpoint = this.smallbreakpoint || "768px";
    const isSmall = typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${smallbreakpoint}px)`).matches : true;
    this.setState({
      isSmall
    });
  }

  public render() {
    const {
      _id,
      className,
      columns,
      gap,
      margin,
      gridArea,
      advanced,
      __children: { children = [] },
      __renderSubtree,
    } = this.props;
    const { isSmall } = this.state;
    const { align, alignContent, alignSelf, fill, justify, justifyContent } = advanced || {};

    const content = children.map((u, idx) => (
      <Box key={u?._id || idx} gridArea={`col-${idx + 1}`}>
        {u?.map(__renderSubtree)}
      </Box>
    ));

    const t = x =>
      ({
        half: '1/2',
        third: '1/3',
        twothird: '2/3',
        quarter: '1/4',
        twoquarter: '2/4',
        threequarter: '3/4',
      }[x] || x);
    const gcolumns = columns
      ?.map(i => i?.split('-') || ['full'])
      ?.map(([min, max]) => (min === max || !min || !max ? t(min) || t(min || max) : [t(min), t(max)])) || ['full'];

    return (<HeadlineContext.Provider value={this.context + 1}>
      <ThemeContext.Consumer>
        {theme => {
          this.smallbreakpoint = theme?.__breakpoints?.small;
          const smallbreakpoint = theme?.__breakpoints?.small || theme?.global?.breakpoints?.small?.value;
          return (<ResponsiveContext.Consumer>
            {size => (<GGrid
              id={_id}
              className={className}
              rows={!isSmall && size !== 'small' ? ['full'] : gcolumns.map(alwaysauto)}
              columns={!isSmall && size !== 'small' ? gcolumns : ['full']}
              areas={this.getAreas(columns, size === 'small')}
              gap={gap}
              margin={margin}
              gridArea={gridArea}
              align={align}
              alignContent={alignContent}
              alignSelf={alignSelf}
              fill={fill !== false && fill !== true ? true : fill}
              justify={justify}
              justifyContent={justifyContent}
            >
              {content}
            </GGrid>)}
          </ResponsiveContext.Consumer>);
        }}
      </ThemeContext.Consumer>
    </HeadlineContext.Provider>);
  }

  private getAreas(colums, isMobile) {
    const result = range(0, colums.length).map(i => [i, i]);
    const ret = result.map(([start, end]) => ({
      name: `col-${end + 1}`,
      start: isMobile ? [0, start] : [start, 0],
      end: isMobile ? [0, end] : [end, 0],
    }));
    return ret;
  }
}
