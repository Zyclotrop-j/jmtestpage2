import React from 'react';
import styled from 'styled-components';
import { BaseBox } from "./BaseBox";

export const uiSchema = {};

const schema = {
  "title": "componentsgrid",
  "description": "A custom element for creating a responsive grid using the CSS Grid module",
  "type": "object",
  "properties": {
    "space": {
      "description": "The space between grid cells",
      "default": "1rem",
      "type": "string"
    },
    "min": {
      "description": "A CSS length value representing x in `minmax(min(x, 100%), 1fr)`",
      "default": "250px",
      "type": "string"
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

const aboc = "sgrid--above";
const Container = styled.div`
  ${props => props.gridArea ? `grid-area: ${props.gridArea};` : ""}
  display: grid;
  grid-gap: var(--s1);
  align-content: start;
  grid-template-columns: 100%;
  grid-gap: ${props => props.space};
  @supports (width: min(${props => props.min}, 100%)) {
    grid-gap: ${props => props.space};
    grid-template-columns: repeat(auto-fill, minmax(min(${props => props.min}, 100%), 1fr));
  }
  &.${aboc} {
    grid-template-columns: repeat(auto-fit, minmax(${props => props.min}, 1fr));
  }
  > * {
    ${props => props.preview ? `
      outline: 3px dashed silver;
    ` : ""}
  }
`;

const resizeobserver = (elem, { min }) => {
  const test = document.createElement('div');
  test.classList.add('test');
  test.style.width = min;
  elem.appendChild(test);
  const br = test.offsetWidth;
  elem.removeChild(test);

  const ro = new ResizeObserver(entries => {
    for (let entry of entries) {
      const cr = entry.contentRect;
      const q = cr.width > br;
      elem.classList.toggle(aboc, q);
    }
  });
  ro.observe(elem);
  return () => ro.disconnect();
}

 const Tmp = props => {
   const {
     min: xmin,
     space: xspace,
     __children: { children = [] },
     __renderSubtree,
     gridArea,
     className,
     preview,
   } = props;
   const space = xspace || "1rem";
   const min = xmin || "250px";

   const el = React.useRef(null);
   React.useEffect(() => {
    if (el?.current && 'ResizeObserver' in window && !CSS.supports('width', `min(${min}, 100%)`)) {
      return resizeobserver(el.current, { min: min })
    }
  }, el);

  const content = children.map((u, idx) => (
    <BaseBox preview={preview} key={u._id || idx}>
      {u?.map(__renderSubtree)}
    </BaseBox>
  ));
   return <Container ref={el} className={className} gridArea={gridArea} min={min} space={space}>
      {content}
   </Container>;
 };

 export const SGrid = props => <Tmp {...props} />
 SGrid.defaultProps = {
   min: "250px",
   space: "1rem",
   content: []
 };
