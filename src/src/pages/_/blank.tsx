import * as React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';

export default class BlankPage extends React.Component<any> {
  public render() {
    const { location } = this.props;
    return <>What are you doing here?</>;
  }
}
