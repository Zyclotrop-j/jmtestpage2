import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { Button } from "grommet";
import { map } from 'ramda';
import { OutboundLink } from 'gatsby-plugin-gtag';
import { Icon } from "./Icon";
import { RichText } from "./RichText";

interface Props {}

export const uiSchema = {
  icon: {
    "ui:widget": "icon"
  }
};

const schema = {
  "title": "componentcalltoaction",
  "type": "object",
  "properties": {
    "a11yTitle": {
      "type": "string",
      "description": "Label the icon for assistive technologies"
    },
    "alignSelf": {
      "type": "string",
      "description": "Self-alignment, start, end, center"
    },
    "color": {
      "type": "string",
      "ui:widget": "grommet-color",
      "description": "Fill color for primary, label color for plain, border color otherwise. Can use theme-colors"
    },
    "fill": {
      "type": "string",
      "description": "Weather this component streches and fills the avail space. horizontal, vertical, true, false, none"
    },
    "gap": {
      "type": "string",
      "description": "xxsmall, xsmall, small, medium, large, xlarge or any css-size"
    },
    "href": {
      "type": "string",
      "description": "Link to a local or remote site"
    },
    "icon": {
      "type": "string",
      "ui:widget": "icon",
      "description": "Icon name in form of <lib>/<icon>, e.g. de/Aed, gi/GiSpiderBot or fi/FiHeart. Lazy loads icons!"
    },
    "label": {
      "type": "string",
      "description": "The text to display on the cta"
    },
    "richtext": {
      "type": "string",
      "ui:widget": "markdown",
      "description": "Advanced: Use markdown for the label"
    },
    "margin": {
      "type": "object",
      "description": "Margin",
      "properties": {
        "top": {
          "type": "string",
          "description": "Margin-top: xsmall, small, medium, large, xlarge, valid css-size"
        },
        "bottom": {
          "type": "string",
          "description": "Margin-bottom: xsmall, small, medium, large, xlarge, valid css-size"
        },
        "left": {
          "type": "string",
          "description": "Margin-left: xsmall, small, medium, large, xlarge, valid css-size"
        },
        "right": {
          "type": "string",
          "description": "Margin-right: xsmall, small, medium, large, xlarge, valid css-size"
        }
      }
    },
    "pageAction": {
      "type": "string",
      "ui:widget": "pageaction",
      "description": "A page-action to trigger when the button is clicked"
    },
    "plain": {
      "description": "Whether this is a plain button with no border or pad.",
      "type": "boolean",
      "default": false
    },
    "primary": {
      "description": "Make this button the primary one",
      "type": "boolean",
      "default": false
    },
    "reverse": {
      "description": "Whether an icon and label should be reversed so that the icon is at the end of the anchor.",
      "type": "boolean",
      "default": false
    }
  }
};

export class CallToAction extends React.PureComponent<Props> {

  static defaultProps = {
    a11yTitle: "",
    alignSelf: "",
    color: "",
    fill: "true",
    gap: "",
    href: "",
    richtext: "",
    icon: "",
    label: "",
    margin: {},
    pageAction: "",
    plain: false,
    primary: false,
    reverse: false
  }

  public render() {
    const {
      _id,
      className,
      a11yTitle,
      alignSelf,
      color,
      fill,
      gap,
      gridArea,
      href,
      icon,
      label,
      margin,
      pageAction,
      plain,
      primary,
      reverse,
      richtext
    } = this.props;

    // // TODO:
    const pageActions = {};

    // the following regex is how gatsby tests it!
    const localLink = /^\/(?!\/)/.test(href) ? { as: Link, to: href } : { as: OutboundLink, rel: "noopener" };
    const onClick = pageActions[pageAction] || undefined;
    const cfill = ["false", "none", ""].includes(fill) ? false : (
      ["horizontal", "vertical"].includes(fill) ? fill : true
    );
    const content = richtext && richtext.trim() ? <RichText>{richtext}</RichText> : label || undefined;
    return (
      <Button
        id={_id}
        {...localLink}
        href={href && href !== "none" ? href : undefined}
        a11yTitle={a11yTitle || undefined}
        alignSelf={alignSelf || undefined}
        color={color || undefined}
        fill={cfill}
        gap={gap || undefined}
        gridArea={gridArea || undefined}
        icon={icon ? <Icon icon={icon} /> : null}
        label={content}
        margin={margin || undefined}
        onClick={onClick}
        plain={plain || false}
        primary={primary || undefined}
        reverse={reverse || undefined}
        className={className}
      />
    );
  }
}
