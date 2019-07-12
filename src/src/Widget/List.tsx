import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import ReactDOM from 'react-dom';
import { once } from "ramda";

interface Props {

}

const Li = styled.li`
  & > * {
    display: inline-flex;
  }
`;
const basedefs = [
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
  "cjk-ideographic"
].reduce((p, i) => ({
  ...p,
  [i]: `list-style-type: ${i};`
}), {})

const stlyeDefs = {
  ...basedefs,
  none: css`list-style: none;`,
  None: css`list-style: none;`,
  Circle: css`
  ${Li} {
    padding-left: 4.25em;
  }
  ${Li}:before{
    position: absolute;
    left: 2.75em;
    width: 1em;
    height: 1em;
    padding: .5em;
    margin-right: 1em;
    font-weight: bold;
    text-align: center;
    display: inline-block;
    background: #000;
    color: #fff;
    border-radius: 50%;
    border: .25em solid #ccc;
  }
  `,
  Square: css`
  ${Li} {
    padding-left: 4.25em;
  }
  ${Li}:before{
    position: absolute;
    left: 2.75em;
    width: 1em;
    height: 1em;
    padding: .5em;
    margin-right: 1em;
    font-weight: bold;
    text-align: center;
    display: inline-block;
    background: #000;
    color: #fff;
    border: .25em solid #ccc;
    background: #000;
    color: #fff;
  }
  `,
  Diamond: css`
  ${Li} {
    padding-left: 4.25em;
  }
  ${Li}:before{
    position: absolute;
    left: 2.75em;
    width: 1em;
    height: 1em;
    padding: .5em;
    margin-right: 1em;
    font-weight: bold;
    text-align: center;
    display: inline-block;
    background: #000;
    color: #fff;
    transform: rotate(45deg);
    text-transform: rotate(90deg);
  }
  `,
  Large: css`
  ${Li} {
    padding-left: 2em;
  }
  ${Li}:before{
    position: absolute;
    left: 0.5em;
    color:#666;
    font: bold;
    font-size: 2em;
    margin-right: .5em;
  }
  `
}

const liststyleswitcher = css`
${props => ["Circle", "Square", "Diamond", "Large"].includes(props.type) ? css`
  counter-reset: list-counter;
  list-style: none;
  float:left;
  ${Li} {
      margin: 1.5em 0;
      ${props => props.type === "Large" ? "line-height: 1em" : ""};
  }
  ${Li}:before{
      content: counter(list-counter);
      counter-increment: list-counter;

  }
` : ""}
${props => stlyeDefs[props.type]}
`;

const Ul = styled.ul`
${props => props.mobile ? css`
  ${props.theme.mq(null, "m")(mobilecss)}
  ${props.theme.mq("m", null)(liststyleswitcher)}
  ` : liststyleswitcher}
`;
const mobilecss = css`
  padding: 0;
  & > ${Li} {
    display: inline;
    &:after {
      content: ',';
    }
    &:last-child:after {
      content: '';
    }
  }
`;
const Ol = styled.ol`
${props => props.mobile ? css`
  ${props.theme.mq(null, "m")(mobilecss)}
  ${props.theme.mq("m", null)(liststyleswitcher)}
  ` : liststyleswitcher}
`;


export const uiSchema = {
  "type": {
    "ui:widget": "list",
    "ui:options": {
      "getList": () => [
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
      ]
    }
  }
};

const schema = {
  "title": "componentlist",
  "type": "object",
  "properties": {
    "type": {
      "description": "The list icon type",
      "default": "cirlce",
      "type": "string"
    },
    "adjustForMobile": {
      "description": "Convert to a comma-seperated list for mobile devices",
      "defualt": true,
      "type": "boolean"
    },
    "content": {
      "type": "array",
      "items": {
        "type": "string",
        "x-$ref": "componentgroup"
      }
    }
  }
};

export const List = (props) => {

  const {
    _id,
    __children: { children = [] },
    __renderSubtree,
    adjustForMobile,
    type: listtype,
  } = props;

  const numberedTypes = [
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
  ];
  const unorderedTypes = [
    "none",
    "disc",
    "square",
    "circle"
  ];

  const content = children.map((u, idx) => (
    <Li key={u._id || idx}>
      {u.map(__renderSubtree)}
    </Li>
  ));

  if(numberedTypes.includes(listtype)) {
    return (<Ol mobile={adjustForMobile} type={listtype}>
      {content}
    </Ol>)
  }
  if(unorderedTypes.includes(listtype)) {
    return (<Ul mobile={adjustForMobile} type={listtype}>
      {content}
    </Ul>)
  }
  return (<span>Invalid Type {listtype} selected!</span>);
};
