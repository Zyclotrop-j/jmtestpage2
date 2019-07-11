import * as React from 'react';
import { Wrapper } from '../components';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';

export default class NotFoundPage extends React.Component<any> {
  public render() {
    /*
    "none",
    "disc",
    "square",
    "circle",
    "decimal",
    "decimal-leading-zero",
    "lower-alpha",
    "upper-alpha",
    "lower-roman",
    "upper-roman",
    "lower-greek",
    "georgian",
    "hebrew",
    "hiragana",
    "hiragana-iroha",
    "katakana",
    "katakana-iroha",
    "cjk-ideographic",
    "Circle",
    "Square",
    "Diamond",
    "Large"
    */
    return (
      <Wrapper>
        <h1>NOT FOUND</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </Wrapper>
    );
  }
}
