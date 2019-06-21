import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Grid } from "grommet";
import { identity, ap, map, append, zipObj } from "ramda";
import { Value as GValue } from 'grommet-controls';
import { Icon } from "./Icon";
import { RichText } from "./RichText";
import { Headline } from "./Headline";
import { Text } from "./Text";
import { CallToAction } from "./CallToAction";
import { Picture } from "./Picture";

const OIcon = styled(Icon)`
  align-self: ${props => props["align-self"]};
  justify-self: ${props => props["justify-self"]};
`;
const OPicture = styled(Picture)`
  font-size: 10px;
  align-self: ${props => props["align-self"]};
  justify-self: ${props => props["justify-self"]};
`;
const OHeading = styled(Headline)`
  align-self: ${props => props["align-self"]};
  justify-self: ${props => props["justify-self"]};
`;
const OParagraph = styled(RichText)`
  align-self: ${props => props["align-self"]};
  justify-self: ${props => props["justify-self"]};
`;
const OButton = styled(CallToAction)`
  align-self: ${props => props["align-self"]};
  justify-self: ${props => props["justify-self"]};
`;
const OText = styled(RichText)`
  align-self: ${props => props["align-self"]};
  justify-self: ${props => props["justify-self"]};
`;
// !importan is to overwrite patterns like :nth-child(4n+1)-rules
const IGrid = styled(Grid)`
  grid-column-end: span ${({ width }) => width ? `${width} !important` : 1};
  grid-row-end: span ${({ height }) => height ? `${height} !important` : 1};
`;

// grid-auto-flow: column;
// grid-auto-flow: dense;
// grid-auto-columns: 1fr 2fr;
// grid-auto-rows: minmax(100px, auto);
// grid-auto-flow: row dense;
// grid-auto-rows: 1fr 2fr;
const AutoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: ${({ gap }) => (gap)};
  grid-auto-flow: dense;
  min-width: ${props => props.width};
  ${props => props.extend}
`;
const OverflowBox = styled(Box)`
  overflow: ${props => props.overflow ? "auto": "unset"};
  scroll-snap-type: x mandatory;
  scroll-snap-points-x: repeat(${props => props.scrollSize});
  & > ${AutoGrid} > ${IGrid} {
    scroll-snap-align: none center;
  }
`;


export const uiSchema = {
  gridlayout: {
    "ui:widget": "list",
    "ui:options": {
      getList: () => Cards.gridlayout
    }
  }
};

const schema = {
  "title": "componentcards",
  "type": "object",
  "properties": {
    "leftColumn": {
      "description": "Size of the left column. Any valid css grid-column size. Defaults to 'auto'. Options: 'auto', '1fr', '0.5fr', '100px', 'minmax(100px, 1fr)', 'minmax(10%, 200px)'",
      "type": "string"
    },
    "cardlayout": {
      "description": "sidetoside: display picture on the left of the text. others: Items underneith eath other in different orders",
      "enum": ["sidetoside", "standard", "headlinefirst", "ctafocus"]
    },
    "gridlayout": {
      "description": "Layout of the overall grid that contains all cards",
      "type": "string",
      "examples": ["twocolumn", "threecolumn", "eightcolumn"]
    },
    "align": {
      "type": "string",
      "description": "Default alignment (vertical) of the cards; start, center, end"
    },
    "justify": {
      "type": "string",
      "description": "Default justification (horizontal) of the cards; start, center, end"
    },
    "imgtype": {
      "description": "Use an image or an icon. Can be overwritte on item level",
      "enum": ["ICON", "PICTURE"],
      "default": "PICTURE"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "layout": {
            "enum": ["sidetoside", "standard", "headlinefirst", "ctafocus"],
            "description": "Overwrite the layout of this card"
          },
          "imgtype": {
            "description": "Use an image or an icon",
            "enum": ["ICON", "PICTURE"]
          },
          "iconAlign": {
            "type": "string",
            "description": "Overwrite the icon alignment"
          },
          "iconJustify": {
            "type": "string",
            "description": "Overwrite the icon justify"
          },
          "headingAlign": {
            "type": "string",
            "description": "Overwrite the headline alignment"
          },
          "headingJustify": {
            "type": "string",
            "description": "Overwrite the headline justify"
          },
          "textAlign": {
            "type": "string",
            "description": "Overwrite the text alignment"
          },
          "textJustify": {
            "type": "string",
            "description": "Overwrite the text justify"
          },
          "ctaAlign": {
            "type": "string",
            "description": "Overwrite the cta alignment"
          },
          "ctaJustify": {
            "type": "string",
            "description": "Overwrite the cta justify"
          },
          "disclaimAlign": {
            "type": "string",
            "description": "Overwrite the disclaimer alignment"
          },
          "disclaimJustify": {
            "type": "string",
            "description": "Overwrite the disclaimer justify"
          },
          "icon": {
            "type": "string",
            "description": "The icon-component to use",
            "x-$ref": "componenticon"
          },
          "picture": {
            "type": "string",
            "description": "The picture-component to use",
            "x-$ref": "componentpicture"
          },
          "heading": {
            "type": "string",
            "description": "The heading-component to use",
            "x-$ref": "componentheadline"
          },
          "paragraph": {
            "type": "string",
            "description": "The paragraph-component to use",
            "x-$ref": "componentrichtext"
          },
          "cta": {
            "type": "string",
            "description": "The cta-component to use",
            "x-$ref": "componentcalltoaction"
          },
          "disclaim": {
            "type": "string",
            "description": "The disclaim-component to use",
            "x-$ref": "componentrichtext"
          }
        }
      }
    }
  }
};
const varients = {
  "": "",
  alternatewidth: `
    grid-template-columns: repeat(6, 1fr);
    & > ${IGrid}:nth-child(2n+1) {
      grid-column-end: span 2;
      grid-row-end: span 1;
    }
  `,
  alternateheight: `
    & > ${IGrid}:nth-child(2n+1) {
      grid-column-end: span 1;
      grid-row-end: span 2;
    }
  `,
  alternatesize: `
    & > ${IGrid}:nth-child(2n+1) {
      grid-column-end: span 2;
      grid-row-end: span 2;
    }
  `,
  mixedmany: `
    & > ${IGrid}:nth-child(3n+1) {
      grid-column-end: span 2;
      grid-row-end: span 1;
    },
    & > ${IGrid}:nth-child(2n+1) {
      grid-column-end: span 1;
      grid-row-end: span 2;
    }
  `,
  mixedfew: `
    & > ${IGrid}:nth-child(5n+1) {
      grid-column-end: span 2;
      grid-row-end: span 1;
    },
    & > ${IGrid}:nth-child(7n+1) {
      grid-column-end: span 1;
      grid-row-end: span 2;
    }
  `,
  mixedfew: `
    & > ${IGrid}:nth-child(5n+1) {
      grid-column-end: span 2;
      grid-row-end: span 1;
    },
    & > ${IGrid}:nth-child(7n+1) {
      grid-column-end: span 1;
      grid-row-end: span 2;
    }
  `,
};
const basegridlayouts = {
  auto: `
    grid-template-columns: repeat(auto-fit, 10em);
  `,
  quarteritem: `
    grid-template-columns: repeat(auto-fit, 2.5em);
  `,
  halfitem: `
    grid-template-columns: repeat(auto-fit, 5em);
  `,
  singleitem: `
    grid-template-columns: repeat(auto-fit, 10em);
  `,
  oneandhalfitem: `
    grid-template-columns: repeat(auto-fit, 15em);
  `,
  doubleitem: `
    grid-template-columns: repeat(auto-fit, 20em);
  `,
  oneitem: `
    grid-template-columns: repeat(auto-fit, 10em);
  `,
  twoitem: `
    grid-template-columns: repeat(auto-fit, 20em);
  `,
  threeitem: `
    grid-template-columns: repeat(auto-fit, 30em);
  `,
  fouritem: `
    grid-template-columns: repeat(auto-fit, 40em);
  `,
  eightitem: `
    grid-template-columns: repeat(auto-fit, 80em);
  `,
  singlecolumn: `
    grid-template-columns: 1fr;
  `,
  onecolumn: `
    grid-template-columns: 1fr;
  `,
  twocolumn: `
    grid-template-columns: repeat(2, 1fr);
    ${props => props.theme.mq(null, "s")(css`
      grid-template-columns: 1fr;
    `)}
  `,
  threecolumn: `
    grid-template-columns: repeat(3, 1fr);
  `,
  fourcolumn: `
    grid-template-columns: repeat(4, 1fr);
  `,
  fivecolumn: `
    grid-template-columns: repeat(5, 1fr);
  `,
  sixcolumn: `
    grid-template-columns: repeat(6, 1fr);
  `,
  sevencolumn: `
    grid-template-columns: repeat(7, 1fr);
  `,
  eightcolumn: `
    grid-template-columns: repeat(8, 1fr);
  `,
  ninecolumn: `
    grid-template-columns: repeat(9, 1fr);
  `,
  tencolumn: `
    grid-template-columns: repeat(10, 1fr);
  `,
  elevencolumn: `
    grid-template-columns: repeat(11, 1fr);
  `,
  twelvecolumn: `
    grid-template-columns: repeat(12, 1fr);
  `,
  sixteencolumn: `
    grid-template-columns: repeat(16, 1fr);
  `,
};
const combinedgridlayout = zipObj(
  ap(map(append, Object.keys(varients)), Object.keys(basegridlayouts)).map(i => i.join("")),
  ap(map(append, Object.values(varients)), Object.values(basegridlayouts)).map(i => i.join(""))
);

export class Cards extends React.PureComponent<Props> {

    static layouts = {
      sidetoside: [
        { name: 'icon', start: [0, 0], end: [0, 4] },
        { name: 'headline', start: [1, 0], end: [1, 1] },
        { name: 'text', start: [1, 2], end: [1, 2] },
        { name: 'cta', start: [1, 3], end: [1, 3] },
        { name: 'disclaim', start: [1, 4], end: [1, 4] }
      ],
      standard: [
        { name: 'icon', start: [0, 0], end: [1, 0] },
        { name: 'headline', start: [0, 1], end: [1, 1] },
        { name: 'text', start: [0, 2], end: [1, 2] },
        { name: 'cta', start: [0, 3], end: [1, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] },
      ],
      headlinefirst: [
        { name: 'headline', start: [0, 0], end: [1, 0] },
        { name: 'icon', start: [0, 1], end: [1, 1] },
        { name: 'text', start: [0, 2], end: [1, 2] },
        { name: 'cta', start: [0, 3], end: [1, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] },
      ],
      ctafocus: [
        { name: 'icon', start: [0, 0], end: [1, 0] },
        { name: 'cta', start: [0, 1], end: [1, 1] },
        { name: 'headline', start: [0, 2], end: [1, 2] },
        { name: 'text', start: [0, 3], end: [1, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] },
      ],
      sidetosidefullfooter: [
        { name: 'icon', start: [0, 0], end: [0, 3] },
        { name: 'headline', start: [1, 0], end: [1, 1] },
        { name: 'text', start: [1, 2], end: [1, 2] },
        { name: 'cta', start: [1, 3], end: [1, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] }
      ],
      sidetosidebody: [
        { name: 'headline', start: [0, 0], end: [1, 0] },
        { name: 'icon', start: [0, 1], end: [0, 2] },
        { name: 'text', start: [1, 1], end: [1, 2] },
        { name: 'cta', start: [0, 3], end: [1, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] }
      ],
      sidetosidetextcta: [
        { name: 'headline', start: [0, 0], end: [1, 0] },
        { name: 'icon', start: [0, 1], end: [0, 3] },
        { name: 'text', start: [1, 1], end: [1, 2] },
        { name: 'cta', start: [1, 3], end: [1, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] }
      ],
      sidetosidefullheader: [
        { name: 'headline', start: [0, 0], end: [1, 0] },
        { name: 'icon', start: [0, 1], end: [0, 4] },
        { name: 'text', start: [1, 1], end: [1, 2] },
        { name: 'cta', start: [1, 3], end: [1, 3] },
        { name: 'disclaim', start: [1, 4], end: [1, 4] }
      ],
      sidetosiderev: [
        { name: 'icon', start: [1, 0], end: [1, 4] },
        { name: 'headline', start: [0, 0], end: [0, 1] },
        { name: 'text', start: [0, 2], end: [0, 2] },
        { name: 'cta', start: [0, 3], end: [0, 3] },
        { name: 'disclaim', start: [0, 4], end: [0, 4] }
      ],
      sidetosiderevfullfooter: [
        { name: 'icon', start: [1, 0], end: [1, 3] },
        { name: 'headline', start: [0, 0], end: [0, 1] },
        { name: 'text', start: [0, 2], end: [0, 2] },
        { name: 'cta', start: [0, 3], end: [0, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] }
      ],
      sidetosiderevbody: [
        { name: 'headline', start: [0, 0], end: [1, 0] },
        { name: 'icon', start: [1, 1], end: [1, 2] },
        { name: 'text', start: [0, 1], end: [0, 2] },
        { name: 'cta', start: [0, 3], end: [1, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] }
      ],
      sidetosiderevtextcta: [
        { name: 'headline', start: [0, 0], end: [1, 0] },
        { name: 'icon', start: [1, 1], end: [1, 3] },
        { name: 'text', start: [0, 1], end: [0, 2] },
        { name: 'cta', start: [0, 3], end: [0, 3] },
        { name: 'disclaim', start: [0, 4], end: [1, 4] }
      ],
      sidetosiderevfullheader: [
        { name: 'headline', start: [0, 0], end: [1, 0] },
        { name: 'icon', start: [1, 1], end: [1, 4] },
        { name: 'text', start: [0, 1], end: [0, 2] },
        { name: 'cta', start: [0, 3], end: [0, 3] },
        { name: 'disclaim', start: [0, 4], end: [0, 4] }
      ],
    };

  static gridlayout = combinedgridlayout;

  static defaultProps = {
    layout: "standard",
    align: "",
    justify: "",
    leftColumn: 'auto',
    mode: "SCROLL",
    items: [],
    ___resolveid: identity
  }

  public render() {
    const {
      _id,
      mode,
      leftColumn,
      className,
      gridArea,
      imgtype,
      gridlayout,
      cardlayout,
      align,
      justify,
      items,
      gap,
      __renderSubtree,
      preview,
      ___editor,
      ___resolveid
    } = this.props;

    // ___resolveid = ___resolveid || identity; // make sure also a null-value is overwritten - we probably don't need this

    const cardlist = items.map(item => {
      const itemimgtype = item.imgtype || imgtype;
      if(preview && ___editor) { // We need this for the editor
        // // TODO: Find better solution
        const h = item.heading && ___resolveid(item.heading);
        const p = item.paragraph && ___resolveid(item.paragraph);
        const c = item.cta && ___resolveid(item.cta);
        const d = item.disclaim && ___resolveid(item.disclaim);
        const o = item.icon && ___resolveid(item.icon);
        const g = item.picture && ___resolveid(item.picture);
        return (<IGrid
          className={className}
          gridArea={gridArea}
          rows={['auto', 'auto', 'auto', 'auto', 'auto']}
          columns={[leftColumn || 'auto', 'flex']}
          fill={true}
          align={item.align || align}
          justify={item.justify || justify}
          areas={Cards.layouts[(item.layout || "").toLowerCase()] || Cards.layouts[(cardlayout || "").toLowerCase()] || Cards.layouts.standard}
          width={item.width}
          height={item.height}
        >
          {h && React.createElement(___editor, { ...h, customtitle: "Card Headline", gridArea: "headline" }, <OHeading preview align-self={item.headingAlign} justify-self={item.headingJustify} gridArea="headline" {...___resolveid(item.heading)} />)}
          {p && React.createElement(___editor, { ...p, customtitle: "Card Text", gridArea: "text" }, <OParagraph preview align-self={item.textAlign} justify-self={item.textJustify} gridArea="text" {...___resolveid(item.paragraph)} />)}
          {c && React.createElement(___editor, { ...c, customtitle: "Card Button", gridArea: "cta" }, <OButton preview align-self={item.ctaAlign} justify-self={item.ctaJustify} gridArea="cta" {...___resolveid(item.cta)} />)}
          {d && React.createElement(___editor, { ...d, customtitle: "Card Disclaimer", gridArea: "disclaim" }, <OText preview align-self={item.disclaimAlign} justify-self={item.disclaimJustify} gridArea="disclaim" {...___resolveid(item.disclaim)} />)}
          {itemimgtype === "ICON" && o && React.createElement(___editor, { ...o, customtitle: "Card Icon", gridArea: "icon" }, <OIcon preview align-self={item.iconAlign} justify-self={item.iconJustify} gridArea="icon" {...___resolveid(item.icon)} />)}
          {itemimgtype === "PICTURE" && g && React.createElement(___editor, { ...g, customtitle: "Card Picture", gridArea: "icon" }, <OPicture preview align-self={item.iconAlign} justify-self={item.iconJustify} gridArea="icon" {...___resolveid(item.picture)} />)}
        </IGrid>);
      }
      const iconpicture = [];
      if(itemimgtype === "ICON") {
        iconpicture.push(<OIcon align-self={item.iconAlign} justify-self={item.iconJustify} gridArea="icon" {...___resolveid(item.icon)} />);
      }
      if(itemimgtype === "PICTURE") {
        iconpicture.push(<OPicture align-self={item.iconAlign} justify-self={item.iconJustify} gridArea="icon" {...___resolveid(item.picture)} />);
      }
      return (<IGrid
        className={className}
        gridArea={gridArea}
        rows={['auto', 'auto', 'auto', 'auto', 'auto']}
        columns={[leftColumn || "auto", 'flex']}
        fill={true}
        align={item.align || align}
        justify={item.justify || justify}
        areas={Cards.layouts.sidetosidetextcta || Cards.layouts[(item.layout || "").toLowerCase()] || Cards.layouts[(cardlayout || "").toLowerCase()] || Cards.layouts.standard}
        width={item.width}
        height={item.height}
      >
        {iconpicture}
        <OHeading align-self={item.headingAlign} justify-self={item.headingJustify} gridArea="headline" {...___resolveid(item.heading)} />
        <OParagraph align-self={item.textAlign} justify-self={item.textJustify} gridArea="text" {...___resolveid(item.paragraph)} />
        <OButton align-self={item.ctaAlign} justify-self={item.ctaJustify} gridArea="cta" {...___resolveid(item.cta)} />
        <OText align-self={item.disclaimAlign} justify-self={item.disclaimJustify} gridArea="disclaim" {...___resolveid(item.disclaim)} />
      </IGrid>);
    });

    const defaultgap = "10px";
    const defaultgridlayout = Cards.gridlayout.auto;
    const scrollSizes = {
      "auto": 10,
      "quarteritem": 2.5,
      "halfitem": 5,
      "singleitem": 10,
      "oneandhalfitem": 15,
      "doubleitem": 20,
      "oneitem": 10,
      "twoitem": 20,
      "threeitem": 30,
      "fouritem": 40,
      "eightitem": 80
    };
    const scrollSize = Object.entries(scrollSizes).find(([k]) => (gridlayout || defaultgridlayout).indexOf(k) > -1);
    const width = (mode || "").toLowerCase() === "scroll" && scrollSize ? `calc(
      ${cardlist.length * scrollSize[1]}em + ${cardlist.length} * ${gap || defaultgap}
    )` : null;

    return (<OverflowBox
        id={_id}
        className={className}
        gridArea={gridArea}
        overflow={(mode || "").toLowerCase() === "scroll"}
        scrollSize={scrollSize ? scrollSize[1] : "100vw"}
      ><AutoGrid
      width={width || "unset"}
      gap={gap || defaultgap}
      extend={Cards.gridlayout[gridlayout] || defaultgridlayout}
    >
      {cardlist}
    </AutoGrid></OverflowBox>);
  }
}
