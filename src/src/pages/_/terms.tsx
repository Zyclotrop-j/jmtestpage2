import * as React from 'react';
import { graphql } from 'gatsby';
import { Wrapper } from '../../components';
import { RichText } from "../../Widget";
import { TermsAndConditions, copyright } from "../../components/Imprint_And_Privacy";

export const query = graphql`
  query {
    site {
      buildTime(formatString: "YYYY-MM-DD")
      fulldate: buildTime(formatString: "YYYY-MM-DD")
      year: buildTime(formatString: "YYYY")
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

const ur = x => {
  if(x.startsWith("ENCRYPT_")) {
    return x.substring("ENCRYPT_".length).split("-").map((i, idx) => String.fromCharCode(i - idx)).join("");
  }
  return x;
};
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
          _id="Terms"
          markdown={TermsAndConditions({
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
          _id="Copyright"
          markdown={copyright({
            name: this.state.name,
            addr: this.state.addr,
            email: this.state.email,
            phone: this.state.phone,
            websitename: this.state.websitename,
            website: this.state.website,
            date: this.props?.data?.site.buildTime,
            fulldate: this.props?.data?.site.fulldate,
            year: this.props?.data?.site.year
          })}
          urlescaped={false}
          escaped={false}
          b64={false}
        />
      </Wrapper>
    );
  }
}
