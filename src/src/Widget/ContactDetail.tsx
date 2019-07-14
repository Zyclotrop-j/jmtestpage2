import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { Heading } from 'grommet';
import { Helmet } from "react-helmet";
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
          <script type="application/ld+json">{`
            {
              "@context": "http://schema.org",
              "@type": "Organization",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Paris, France",
                "postalCode": "F-75002",
                "streetAddress": "38 avenue de l'Opera"
              },
              "email": "secretariat@google.org",
              "faxNumber": "( 33 1) 42 68 53 01",
              "member": [
                {
                  "@type": "Organization"
                },
                {
                  "@type": "Organization"
                }
              ],
              "alumni": [
                {
                  "@type": "Person",
                  "name": "Jack Dan"
                },
                {
                  "@type": "Person",
                  "name": "John Smith"
                }
              ],
              "name": "Google.org (GOOG)",
              "telephone": "( 33 1) 42 68 53 00"
            }
          `}</script>
            

          </div>)}
    </HeadlineContext.Consumer>);
  }
}
