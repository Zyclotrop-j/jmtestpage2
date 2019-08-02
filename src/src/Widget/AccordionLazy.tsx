import React, { useState, useEffect } from 'react';
import { Accordion as YAccordion, AccordionPanel } from "grommet";
import styled from 'styled-components';
import ReactDOM from 'react-dom';
import LazyLoad from 'react-lazyload';
import { once } from "ramda";
import Observer from '@researchgate/react-intersection-observer';
import { forceCheck } from 'react-lazyload';

interface Props {

}

export const uiSchema = {

};

const schema = {
  "title": "componentaccordion",
  "type": "object",
  "properties": {
    "allowMultipleExpanded": {
      "description": "Allow multiple tabs to be expanded. If false, on uncollapsing a tab, the previously uncollased one closes",
      "type": "boolean"
    },
    "allowZeroExpanded": {
      "description": "Allow no tab to be expanded",
      "type": "string"
    },
    "level": {
      "description": "headline level",
      "type": "number",
      "minimum": 1,
      "maximum": 6,
      "multipleOf": 1.0
    },
    "preExpanded": {
      "description": "List all tabs that are initially expanded",
      "default": [],
      "items": {
        "type": "integer",
        "minimum": 0
      }
    },
    "content": {
      "type": "string",
      "x-$ref": "componentgroup"
    }
  }
};

const importAccordion = once((cb) => import('./Accordion').then(c => cb(c.Accordion)));

const Tmp = (props) => {
  // We Wrap the Component to avoid react doing reducer magic
  const [{ Component }, setContent] = useState({ Component: () => Placeholder });
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const handleStatusChange = status => setReduceMotion(status.matches);

    const mediaQuery = window.matchMedia("all and (prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleStatusChange, { passive: true });

    return () => mediaQuery.removeEventListener("change", handleStatusChange, { passive: true });
  });


  const {
    _id,
    allowMultipleExpanded,
    allowZeroExpanded,
    level,
    content,
    preExpanded,
    __children: { children = [] },
    __renderSubtree
  } = props;


  const content3 = children.map((u, idx) => (
    <AccordionPanel key={u ? u._id : idx} label={content?.[idx]?.headline || "No headline found"}>
      {u?.map(__renderSubtree)}
    </AccordionPanel>
  ));

  const Placeholder = (<YAccordion
    onActive={forceCheck}
    animate
  >
    {content3}
  </YAccordion>);

  const f = event => event.isIntersecting && importAccordion(Component => setContent({
    Component
  }));

  return (<Observer root={document.querySelector(".Pane.horizontal.Pane2") || document.querySelector("#page-wrap")} key={_id} onChange={f}>
    <div><Component {...props} /></div>
  </Observer>);
};

//
export const Accordion = (props) => <Tmp {...props} />;
