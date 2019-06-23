import * as React from 'react';
import { Wrapper } from '../components';
import Helmet from 'react-helmet';
import config from '../../config/SiteConfig';
import { Link } from 'gatsby';
import { Anchor } from 'grommet';

import { IconChoose } from "../components/IconChooser";
import { Icon } from "../Widget/Icon";
import { CallToAction } from "../Widget/CallToAction";
import { Spinner } from "../Widget/Spinner";
import { Value } from "../Widget/Value";
import { Cards } from "../Widget/Cards";

export default class IndexPage extends React.Component<any> {
  public render() {
    return (
      <Wrapper>
        <h1>INDEX</h1>
        <p>Basic debug index</p>
        <Link to="/csite">Link sample</Link>
        <Icon icon="fi/FiHeart"/>
        <Icon icon="de/Up"/>
        <Icon icon="de/Down"/>
        <Icon icon="li/arrows_circle_check"/>
        <Icon icon="im/Command"/>
        <CallToAction label="Click me!" href="#cta" icon="gi/GiChampions" />
        <Spinner />
        <Value label="more sales in last quarter" value={{number: "30%"}} />
        <Value label="more sales in last quarter" value={{number: "Not a number!"}} />
        <Value label="more customers" color="brand" value={{richtext: "# 25%"}} />
        <Value label="more success" color="green" value={{number: "100%", icon: "de/Up"}} />
        <Cards layout="fourcolumn" cardlayout="sideToSide" items={[
          {heading: {text: "H 1"}, width: 2, height: 2},
          {heading: {text: "H 2"}},
          {heading: {text: "H 3"}},
          {heading: {text: "H 4"}},
          {heading: {text: "H 5"}},
          {heading: {text: "H 6"}},
          {heading: {text: "H 7"}},
          {heading: {text: "H 8"}},
          {heading: {text: "H 9"}},
          {heading: {text: "H 10"}},
          {heading: {text: "H 11"}},
          {heading: {text: "H 12"}},
          {heading: {text: "H 13"}},
          {heading: {text: "H 14"}},
          {heading: {text: "H 15"}}]}/>
        <Cards cardlayout="standard"/>
        <Cards cardlayout="headlinefirst"/>
        <Cards cardlayout="ctafocus"/>
      </Wrapper>
    );
  }
}
