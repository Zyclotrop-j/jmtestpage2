import * as React from 'react';
import { Wrapper } from '../components';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';

export default class IndexPage extends React.Component<any> {
  public render() {
    return (
      <Wrapper>
      <h1>INDEX</h1>
      <p>Basic debug index</p>
      </Wrapper>
    );
  }
}
