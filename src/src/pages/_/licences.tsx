import * as React from 'react';
import { Wrapper } from '../../components';
import { RichText } from "../../Widget";
import { Licences } from "../../components/Imprint_And_Privacy";

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
    data {
      componentstages {
        slides {
          image {
            src
            alt
            author {
              name
              portfolioUrl
              username
              profileurl
              plattformname
              plattform
            }
          }
        }
      }
      componentpictures {
        src
        alt
        author {
          name
          portfolioUrl
          username
          profileurl
          plattformname
          plattform
        }
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

    const pcs = [
      ...(this.props?.data?.data?.componentpictures || []),
      ...(this.props?.data?.data?.componentstages?.reduce((p, i) =>
        p.concat(i?.slides?.map(j => j.image) || []), []) || [])
    ].filter(pcss => pcss?.author?.name);
    console.log("!!!!!", pcs);

    const c_pcs = pcs => `
"[${pcs.alt || pcs.src}](${pcs.src})"

Picture by [${pcs.author.username}](${pcs.author.portfolioUrl}) ( [${pcs.author.name}](${pcs.author.profileurl}) )
on [${pcs.author.plattformname}](${pcs.author.plattform})

<hr />`;
    const mediamark = `
## Pictures and Media
${pcs.map(c_pcs).join("")}
    `;

    // this.props.data.data.componentpictures[0].author

    // this.props.data.data.componentstages[0].slides[0].image.author

    return (
      <Wrapper>
        <RichText
          _id="Licences"
          markdown={Licences({
            name: this.state.name,
            addr: this.state.addr,
            email: this.state.email,
            phone: this.state.phone,
            websitename: this.state.websitename,
            website: this.state.website,
            others: mediamark
          })}
          urlescaped={false}
          escaped={false}
          b64={false}
        />
      </Wrapper>
    );
  }
}
