import React from 'react';
import { Link as GLink } from 'gatsby';
import styled from 'styled-components';
import { Anchor } from "grommet";
import { OutboundLink } from 'gatsby-plugin-gtag';

export const uiSchema = {};

const schema = {
  "title": "componentlink",
  "type": "object",
  "properties": {
    "plain": {
      "description": "Don't add any markup whatsoever",
      "default": false,
      "type": "boolean"
    },
    "a11yTitle": {
      "description": "Screen reader title",
      "type": "string"
    },
    "href": {
      "description": "The link-destination, e.g. https://foo.com/bar",
      "type": "string"
    },
    "content": {
      "type": "string",
      "x-$ref": "componentgroup"
    }
  }
};

export const Link = props => {
  const {
    plain,
    a11yTitle,
    href: xhref,
    __children: { child = [] },
    __renderSubtree,
    gridArea,
    className,
    preview,
  } = props;

  // Disable navigation in editor, because clicking on any child-edit-button will trigger the link
  const href = preview ? `#preview-${xhref}` : xhref;

  const content = child.map(__renderSubtree);
  const MDLink = styled(GLink)``;
  const as = /^\/(?!\/)/.test(href) ? { as: MDLink, to: href } : { as: OutboundLink, rel: "noopener", referrerpolicy: "origin" };
  if(plain) {
    return <a aria-label={a11yTitle} {...as} href={href} >{content}</a>;
  }
  return <Anchor a11yTitle={a11yTitle} {...as} href={href} label={content} children={content} />;
};
