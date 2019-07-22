import * as React from 'react';
import { graphql } from 'gatsby';
import { Wrapper } from '../../components';
import { RichText } from "../../Widget";
import { Heading } from "grommet";
import { GDPR, privacyPolicy } from "../../components/Imprint_And_Privacy";

export const query = graphql`
  query {
    site {
      siteMetadata {
        name
        addr
        email
        phone
        websitename
        website
      }
    }
  }
`;

const ur = x => x.split("-").map((i, idx) => String.fromCharCode(i - idx)).join("");
export default class PrivacyPolicy extends React.Component<any> {

  componentDidMount() {
    window.requestIdleCallback(() => {
      this.setState({
        ready: true,
        name: ur(this.props?.data?.site?.siteMetadata?.name),
        addr: ur(this.props?.data?.site?.siteMetadata?.addr),
        email: ur(this.props?.data?.site?.siteMetadata?.email),
        phone: ur(this.props?.data?.site?.siteMetadata?.phone),
        websitename: (this.props?.data?.site?.siteMetadata?.websitename),
        website: (this.props?.data?.site?.siteMetadata?.website)
      });
    });
  }

  state = {}

  public render() {

    return (
      <Wrapper>
        <RichText
          _id="PrivacyPolicy"
          markdown={privacyPolicy({
            name: this.state.name,
            addr: this.state.addr,
            email: this.state.email,
            phone: this.state.phone,
            websitename: this.state.websitename,
            website: this.state.website
          })}
          urlescaped={false}
          escaped={false}
          b64={false}
        />
        <hr />
        <RichText
          _id="GDPR"
          markdown={GDPR({
            name: this.state.name,
            addr: this.state.addr,
            email: this.state.email,
            phone: this.state.phone,
            websitename: this.state.websitename,
            website: this.state.website
          })}
          urlescaped={false}
          escaped={false}
          b64={false}
        />
        <hr />
        <Heading level={2}>Opt-out</Heading>
        <a id="GA-Opt-Out" onClick={window.gaOptout} href="#GA-Opt-Out">Deactivate Google Analytics</a>
      </Wrapper>
    );
  }
}
