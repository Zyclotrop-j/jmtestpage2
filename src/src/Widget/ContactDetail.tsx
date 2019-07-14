import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { Heading } from 'grommet';
import { HeadlineContext } from "../utils/headlineContext";

interface Props {}

export class ContactDetail extends React.PureComponent<Props> {

  public render() {
    const {
      _id,
      className,
      a11yTitle,
      gridArea
    } = this.props;

    return (<HeadlineContext.Consumer>
        {def => (<div>
            
          </div>)}
    </HeadlineContext.Consumer>);
  }
}
