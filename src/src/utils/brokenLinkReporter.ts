import React from 'react';
import { OutboundLink } from 'gatsby-plugin-gtag';

const checkedLinks = {};

export default props => {
  React.useEffect(() => {
    if(!/^\/(?!\/)/.test(props.href) && checkedLinks[props.href] === undefined) {
      checkedLinks[props.href] = null;
      fetch(`https://dns.google/resolve?name=${props.href.replace(/https?:\/\//, "")}&type=ANY`, {
        "method":"GET",
        "mode":"cors"
      }).then(i => i.json()).then(i => {
        if(!i.Answer && i.Answer.length) {
          try {
            checkedLinks[props.href] = false;
            window.ga('send', 'exception', {
              'exDescription': `Broken link - ${props.href}`,
              'exFatal': false
            });
          } catch(e) {
            console.warn("reporting is disabled (do you use no-track?)", e);
          }
        } else {
          checkedLinks[props.href] = true;
        }
      });
    }
  });
  return <OutboundLink {...props} />;
}
