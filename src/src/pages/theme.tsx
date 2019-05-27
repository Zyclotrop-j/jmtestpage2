import React, { useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import { readableColor, fontFace } from 'polished';
import { Link, navigate } from 'gatsby';
import { Grommet, TextInput, Markdown, Anchor, Button, Box, Grid, Heading, Text, Paragraph, RadioButton, FormField, CheckBox, RangeInput, ThemeContext, Distribution } from 'grommet';
import { observer } from 'mobx-react';
import WebFont from "webfontloader";
import chroma from "chroma-js";
import StepWizard from 'react-step-wizard';
import distinctColors  from "distinct-colors";
import { Column, Table } from 'react-virtualized';
import { bufferTime } from 'rxjs/operators';
import { Subject } from "rxjs";
import { mergeDeepLeft, splitEvery } from "ramda";
import Worker from 'worker-loader!../utils/createScale.ts';
import { fetchAllSchemas, themeschema } from "../state/schemas";
import { auth } from "../utils/auth";
import { Authentication } from "./admin";
import Form from 'react-jsonschema-form';
import { widgets } from '../components/WidgetForm';
import { ErrorBoundary } from '../components/ErrorBoundary';

const worker1 = new Worker();
const worker2 = new Worker();
const worker3 = new Worker();
const worker4 = new Worker();

const fetchFonts = fetch("https://www.googleapis.com/webfonts/v1/webfonts?sort=trending&key=AIzaSyDk9Mrpeclzx4OastCPcGS5cfZGWHe5eec")
  .then(i => i.json())
  .then(i => i.items);

const TextSample = styled(Text)`
  font-family: ${props => props.font};
`;

const StyledStepWizard = styled(StepWizard)`
  grid-area: content;
`;

const fetchedFonts = [];
const eventStream = new Subject();
const loadfonts = families => {
  eventStream.next(families);
}
eventStream.pipe(bufferTime(1000)).subscribe(val => {
  if(!val.length || ![].concat(...val).length) return;
  const fams = [].concat(...val).filter((i, idx, arr) => !fetchedFonts.includes(i) || arr.indexOf(i) === idx);
  fetchedFonts.push(...fams);
  splitEvery(50, fams).forEach(chunk => {
    WebFont.load({
       google: {
         families: chunk
       }
    });
  });
});

let gfonts = null;
fetchFonts.then(fonts => {
  gfonts = fonts;
});
const FontChooser = ({ onChange, headlinefont, bodyfont }) => {
  const [fonts, setFonts] = useState(gfonts);
  useEffect(() => {
    fetchFonts.then(setFonts);
  });
  const selectFontHeadline = event => {
    const family = event.target.value;
    onChange({
      type: "headline",
      family: family
    });
  };
  const selectFontBody = event => {
    const family = event.target.value;
    onChange({
      type: "body",
      family: family
    });
  };
  if(!fonts) return (<div>Loading</div>);
  const maxWidth = 1000;
  const height = 50;
  return (<Box pad={{ horizontal: "large" }} fill="horizontal" align="center" alignContent="center">
    <Box direction={(headlinefont || bodyfont) ? "column" : "row"} alignSelf="start">
      <Box pad="xsmall">
      {!headlinefont ? <Text size="large">Choose your headline's font</Text> :
        <TextSample as={Heading} level={3} font={headlinefont}>Your headlines use {headlinefont}</TextSample>}
      </Box>
      <Box pad="xsmall">
      {!bodyfont ? <Text size="large">Choose your paragraph's font</Text> :
        <TextSample as={Paragraph} font={bodyfont} css={{ textAlign: "justify" }}>
          Your paragraphs use <b>{bodyfont}</b>.
          Working. I'm sure that in 1985, plutonium is available at every corner drug store, but in 1955, it's a little hard to come by.
          Marty, I'm sorry, but I'm afraid you're stuck here. My god, do you know what this means?
          It means that this damn thing doesn't work at all. Oh, uh, this is my Doc, Uncle, Brown.
          A block passed Maple, that's John F. Kennedy Drive. Precisely. Doc.
        </TextSample>}
      </Box>
    </Box>
    <Table
     width={maxWidth}
     height={400}
     headerHeight={20}
     rowHeight={height}
     rowCount={fonts.length}
     rowGetter={({ index }) => fonts[index]}
     estimatedRowSize={height * fonts.length}
     overscanRowCount={10}
     rowStyle={{ display: "flex" }}
   >
     <Column
       label='Name'
       dataKey='family'
       cellDataGetter={({ rowData }) => rowData}
       width={maxWidth/8*2}
       cellRenderer={data => {
         const { cellData } = data;
         const { family, files } = cellData;
         loadfonts(Object.keys(files).map(i => i === "regular" ? family : `${family}:${i}`));
         return <TextSample font={family}>{family}</TextSample>;
       }}
     />
     <Column
       width={maxWidth/8*3}
       label='Sample'
       dataKey='sample'
       cellDataGetter={({ rowData }) => rowData}
       cellRenderer={data => {
         const { cellData } = data;
         const { family, files } = cellData;
         loadfonts(Object.keys(files).map(i => i === "regular" ? family : `${family}:${i}`));
         return <TextSample font={family}>Sphinx of black quartz, judge my vow</TextSample>;
       }}
     />
     <Column
       width={maxWidth/8}
       label='Headline'
       dataKey='headline'
       cellDataGetter={({ rowData }) => rowData.family}
       cellRenderer={({ cellData }) => <Button label="Headlines" pad="none" value={cellData} onClick={selectFontHeadline} />}
     />
     <Column
       width={maxWidth/8}
       label='Body'
       dataKey='body'
       cellDataGetter={({ rowData }) => rowData.family}
       cellRenderer={({ cellData }) => <Button label="Paragraphs" pad="none" value={cellData} onClick={selectFontBody} />}
     />
     <Column
       width={maxWidth/8}
       label='Last Modified'
       dataKey='lastModified'
     />
   </Table>
 </Box>);
}

const NewTheme = observer(({ schema, onSubmit, onError, context }) => {
  if(!schema || !schema.get()) {
    return <Text gridArea="sitenew">No schema</Text>;
  }
  const colors = [
    "accent-1",
    "accent-2",
    "accent-3",
    "accent-4",
    "light1",
    "light2",
    "light3",
    "light4",
    "neutral1",
    "neutral2",
    "neutral3",
    "neutral4",
    "dark1",
    "dark2",
    "dark3",
    "dark4",
    "statusok",
    "statuswarning",
    "statuscritical",
    "statusdisabled",
    "statusunknown",
  ];
  const globalColors = colors.reduce((p, i) => ({
    ...p,
    [i]: context[i]
  }), {});
  return (<Form
    schema={{
      ...schema.get(),
      properties: {
        global: schema.get().properties.global,
      }
    }}
    widgets={widgets}
    uiSchema={{}}
    onChange={v => v.formData}
    onSubmit={(...args) =>
      onSubmit(...args)
        .then(close)
        .catch(noop)
    }
    onError={(...args) =>
      onError(...args)
        .then(close)
        .catch(noop)
    }
    formData={{
      global: {
        colors: globalColors
      }
    }}
  >
    <Heading level={3}>Preview</Heading>
    <Box pad="medium" border={{ color: 'brand', size: 'small' }}>
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    </Box>
    <hr />
    <Button type="submit" label="Submit" />
    <Button type="button" label="Reset" />
  </Form>)
});

const Colors = ({ Radio, setPalette, choose, brand, shapes, palette, inTheme, grayscale }) => (<>
  <Box>
    <Box direction="row">
      <Radio value="brand" />
    </Box>
    <Box direction="row">
      <Radio value="accent-1" />
      <Radio value="accent-2" />
      <Radio value="accent-3" />
      <Radio value="accent-4" />
    </Box>
    <Box direction="row">
      <Radio value="light1" />
      <Radio value="light2" />
      <Radio value="light3" />
      <Radio value="light4" />
    </Box>
    <Box direction="row">
      <Radio value="neutral1" />
      <Radio value="neutral2" />
      <Radio value="neutral3" />
      <Radio value="neutral4" />
    </Box>
    <Box direction="row">
      <Radio value="dark1" />
      <Radio value="dark2" />
      <Radio value="dark3" />
      <Radio value="dark4" />
    </Box>
    <Box direction="row">
      <Radio value="statusok" />
      <Radio value="statuswarning" />
      <Radio value="statuscritical" />
      <Radio value="statusdisabled" />
      <Radio value="statusunknown" />
    </Box>
  </Box>
  <hr />
  <Button label="New Palette" onClick={setPalette} />
  <Box fill="horizontal" background={brand}>{brand}</Box>
  <Box direction="row">
    {shapes[0][0].map(i => <Box key={i} onClick={choose(i, 0, 0, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
  </Box>
  <Box direction="row">
    {shapes[1][0].map(i => <Box key={i} onClick={choose(i, 1, 0, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
  </Box>
  <Box direction="row">
    {shapes[2][0].map(i => <Box key={i} onClick={choose(i, 2, 0, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
  </Box>
  <Box direction="row">
    {shapes[3][0].map(i => <Box key={i} onClick={choose(i, 3, 0, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
  </Box>
  <Box direction="row">
    {shapes[4][0].map(i => <Box key={i} onClick={choose(i, 4, 0, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
  </Box>
  <hr />
  {palette.map((i, idx) => <>
    <Box fill="horizontal" background={palette[idx]}>{palette[idx]}</Box>
    <Box direction="row">
      {shapes[0][idx + 1].map(i => <Box key={i} onClick={choose(i, 0, idx + 1, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
    </Box>
    <Box direction="row">
      {shapes[1][idx + 1].map(i => <Box key={i} onClick={choose(i, 1, idx + 1, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
    </Box>
    <Box direction="row">
      {shapes[2][idx + 1].map(i => <Box key={i} onClick={choose(i, 2, idx + 1, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
    </Box>
    <Box direction="row">
      {shapes[3][idx + 1].map(i => <Box key={i} onClick={choose(i, 3, idx + 1, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
    </Box>
    <Box direction="row">
      {shapes[4][idx + 1].map(i => <Box key={i} onClick={choose(i, 4, idx + 1, i)} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
    </Box>
  </>)}
  <hr />
  <Box direction="row" wrap>
    {grayscale.map(i => <Box key={i} as={Button} width={`${100/11}%`} pad="small" style={{ minHeight: 22, color: readableColor(i), background: i }}>{inTheme(i)}</Box>)}
  </Box>
</>);

const StyledRadioButton = styled(RadioButton)``;

export default class Theme extends React.Component<any> {
  public constructor(props) {
    super(props);
    this.onMessage = this.onMessage.bind(this);
    this.choose = this.choose.bind(this);
    this.inTheme = this.inTheme.bind(this);
    this.pickPicker = this.pickPicker.bind(this);
    this.choosefont = this.choosefont.bind(this);
    this.saveTheme = this.saveTheme.bind(this);
    this.setThemetitle = this.setThemetitle.bind(this);
    this.setClient = this.setClient.bind(this);
    const palette = distinctColors({
      count: 7,
      samples: Math.random()*10e2+250,
      quality: Math.random()*25+25,
    });
    const shapes1 = palette.map(i => chroma.scale(['black', i.hex(), 'white']).mode('rgb').colors(13).slice(1, -1));
    const shapes2 = shapes1.map(j => j.map(i => chroma(i).saturate(2).hex()));
    const shapes3 = shapes1.map(j => j.map(i => chroma(i).desaturate(2).hex()));
    const shapes4 = shapes1.map(j => j.map(i => chroma(i).darken(2).hex()));
    const shapes5 = shapes1.map(j => j.map(i => chroma(i).brighten(2).hex()));
    const grayscale = chroma.scale(['black', 'white']).mode('rgb').colors(22);
    const shapes = [shapes1, shapes2, shapes3, shapes4, shapes5];
    const templen = shapes[0][0].length;
    const mid = Math.round(templen / 2);
    const end = templen - 1;
    const brand = palette.shift().hex();
    const choice = [0,1,2,3,4,5].map(i => chroma(shapes[1][i][mid+1]));
    const grays = grayscale.map(i => chroma(i));
    const closestColor = (col, sc = choice) => sc.reduce((p, i) =>
      chroma.distance(p, col, "lch") > chroma.distance(i, col, "lch") ? i : p).hex();
    this.state = {
      precomputed: [],
      form: {},
      global: {
        colors: {
          brand: brand,
          "accent-1": shapes[1][0][mid+1],
          "accent-2": shapes[1][1][mid+1],
          "accent-3": shapes[1][2][mid+1],
          "accent-4": shapes[1][3][mid+1],
          "light1": shapes[0][0][end],
          "light2": shapes[0][1][end],
          "light3": shapes[0][2][end],
          "light4": shapes[0][3][end],
          "neutral1": shapes[0][0][mid-1],
          "neutral2": shapes[0][1][mid-1],
          "neutral3": shapes[0][2][mid-1],
          "neutral4": shapes[0][3][mid-1],
          "dark1": shapes[0][0][2],
          "dark2": shapes[0][1][2],
          "dark3": shapes[0][2][2],
          "dark4": shapes[0][3][2],
          "statusok": closestColor("green"),
          "statuswarning": closestColor("yellow"),
          "statuscritical": closestColor("darkred"),
          "statusdisabled": closestColor("gray", grays),
          "statusunknown": closestColor("lightgray", grays),
        }
      },
      anchor: { textDecoration: 'none', hover: { textDecoration: 'none' } },
      palette: palette.map(i => i.hex()),
      shapes,
      grayscale: grayscale
    };
  }

  public componentDidMount() {
    auth.renewSession();
    fetchAllSchemas();
    worker1.addEventListener("message",this.onMessage);
    worker2.addEventListener("message",this.onMessage);
    worker3.addEventListener("message",this.onMessage);
    worker4.addEventListener("message",this.onMessage);

    worker1.postMessage({
      op: "generate",
    });
    worker2.postMessage({
      op: "generate",
    });
    worker3.postMessage({
      op: "generate",
    });
    worker4.postMessage({
      op: "generate",
    });
  }

  public componentWillUnmount() {
    worker1.removeEventListener("message", this.onMessage);
    worker2.removeEventListener("message", this.onMessage);
    worker3.removeEventListener("message", this.onMessage);
    worker4.removeEventListener("message", this.onMessage);
  }

  public onMessage(event) {
    console.log("Received message from worker", event);
    const { pos, op } = event.data.Q;
    const data = event.data.A;
    if(op === "generate") {
      this.setState({
        precomputed: this.state.precomputed.concat([data])
      });
      return;
    }
    const shapes = [...this.state.shapes];
    shapes[pos] = data;
    const templen = shapes[0][0].length;
    const mid = Math.round(templen / 2);
    const end = templen - 1;
    const choice = [0,1,2,3,4,5].map(i => chroma(shapes[0][i][mid+1]));
    const grayColors = this.state.grayscale.map(i => chroma(i));
    const closestColor = (col, sc = choice) => sc.reduce((p, i) =>
      chroma.distance(p, col, "lch") > chroma.distance(i, col, "lch") ? i : p).hex();
    this.setState({
      global: {
        ...this.state.global,
        colors: {
          ...this.state.global.color,
          "accent-1": shapes[1][0][mid+1],
          "accent-2": shapes[1][1][mid+1],
          "accent-3": shapes[1][2][mid+1],
          "accent-4": shapes[1][3][mid+1],
          "light1": shapes[0][0][end],
          "light2": shapes[0][1][end],
          "light3": shapes[0][2][end],
          "light4": shapes[0][3][end],
          "neutral1": shapes[0][0][mid-1],
          "neutral2": shapes[0][1][mid-1],
          "neutral3": shapes[0][2][mid-1],
          "neutral4": shapes[0][3][mid-1],
          "dark1": shapes[0][0][2],
          "dark2": shapes[0][1][2],
          "dark3": shapes[0][2][2],
          "dark4": shapes[0][3][2],
          "statusok": closestColor("green"),
          "statuswarning": closestColor("yellow"),
          "statuscritical": closestColor("darkred"),
          "statusdisabled": closestColor("gray", grayColors),
          "statusunknown": closestColor("lightgray", grayColors),
        }
      },
      shapes
    });
  }

  private inTheme(color) {
    const field = [
      "accent-1",
      "accent-2",
      "accent-3",
      "accent-4",
      "light1",
      "light2",
      "light3",
      "light4",
      "neutral1",
      "neutral2",
      "neutral3",
      "neutral4",
      "dark1",
      "dark2",
      "dark3",
      "dark4",
      "statusok",
      "statuswarning",
      "statuscritical",
      "statusdisabled",
      "statusunknown",
    ];
    return field.find(i => this.state[i] === color) || " ";
  }

  private choose(color, a, b, c) {
    return () => {
      this.setState({
        global: {
          ...this.state.global,
          color: {
            ...this.state.global.color,
            [this.state.picking]: color,
          }
        }
      });
    };
  }

  setLinkUnderline(checked) {
    // mergeDeepLeft
    this.setState({
      anchor: { ...this.state.anchor, textDecoration: checked ? 'underline' : 'none' }
    });
  }

  setLinkHoverUnderline(checked) {
    this.setState({
      anchor: { ...this.state.anchor, hover: { textDecoration: checked ? 'underline' : 'none' } }
    });
  }

  setFontScale(xfontScale) {
    const baseSpacing = xfontScale*3+12; // ~ 24 with 4; between 15 and 30
    const scale = 4 + (Math.pow(1.5, xfontScale*1.2) + 17) * 0.5 ;

    // from grommet-base-theme
    const baseFontSize = baseSpacing * 0.75; // 18
    const fontScale = baseSpacing / scale; // 4
    const fontSizing = factor => ({
      size: `${baseFontSize + factor * fontScale}px`,
      height: `${baseSpacing + factor * fontScale}px`,
      // maxWidth chosen to be ~50 characters wide
      // see: https://ux.stackexchange.com/a/34125
      maxWidth: `${baseSpacing * (baseFontSize + factor * fontScale)}px`,
    });

    const data = {
      fontScale: xfontScale,
      global: {
        font: {
          ...fontSizing(0),
        },
      },
      heading: {
        level: {
          1: {
            small: { ...fontSizing(4) },
            medium: { ...fontSizing(8) },
            large: { ...fontSizing(16) },
            xlarge: { ...fontSizing(24) },
          },
          2: {
            small: { ...fontSizing(2) },
            medium: { ...fontSizing(4) },
            large: { ...fontSizing(8) },
            xlarge: { ...fontSizing(12) },
          },
          3: {
            small: { ...fontSizing(0) },
            medium: { ...fontSizing(2) },
            large: { ...fontSizing(4) },
            xlarge: { ...fontSizing(8) },
          },
          4: {
            small: { ...fontSizing(-0.5) },
            medium: { ...fontSizing(0) },
            large: { ...fontSizing(2) },
            xlarge: { ...fontSizing(4) },
          },
          5: {
            small: { ...fontSizing(-1) },
            medium: { ...fontSizing(-0.5) },
            large: { ...fontSizing(0) },
            xlarge: { ...fontSizing(2) },
          },
          6: {
            small: { ...fontSizing(-1.5) },
            medium: { ...fontSizing(-1) },
            large: { ...fontSizing(-0.5) },
            xlarge: { ...fontSizing(0) },
          },
        },
      },
      paragraph: {
        xsmall: { ...fontSizing(-1.5) },
        small: { ...fontSizing(-1) },
        medium: { ...fontSizing(0) },
        large: { ...fontSizing(1) },
        xlarge: { ...fontSizing(2) },
        xxlarge: { ...fontSizing(4) },
      },
      text: {
        xsmall: { ...fontSizing(-1.5) },
        small: { ...fontSizing(-1) },
        medium: { ...fontSizing(0) },
        large: { ...fontSizing(1) },
        xlarge: { ...fontSizing(2) },
        xxlarge: { ...fontSizing(4) },
      },
    };

    this.setState(mergeDeepLeft(data, this.state));
  }

  setDensity(density) {
    const baseSpacing = density*6; // ~ 24 with 4; between 15 and 30
    const borderSize = Math.floor(Math.pow(1.5, density*1.2) + 17);

    const data = {
      density,
      global: {
        borderSize: {
          xsmall: '1px',
          small: '2px',
          medium: `${borderSize / 6}px`, // 4
          large: `${borderSize / 2}px`, // 12
          xlarge: `${borderSize}px`, // 24
        },
        edgeSize: {
          none: '0px',
          hair: '1px', // for Chart
          xxsmall: `${baseSpacing / 8}px`, // 3
          xsmall: `${baseSpacing / 4}px`, // 6
          small: `${baseSpacing / 2}px`, // 12
          medium: `${baseSpacing}px`, // 24
          large: `${baseSpacing * 2}px`, // 48
          xlarge: `${baseSpacing * 4}px`, // 96
          responsiveBreakpoint: 'small',
        },
        spacing: `${borderSize}px`,
        size: {
          xxsmall: `${baseSpacing * 2}px`, // 48
          xsmall: `${baseSpacing * 4}px`, // 96
          small: `${baseSpacing * 8}px`, // 192
          medium: `${baseSpacing * 16}px`, // 384
          large: `${baseSpacing * 32}px`, // 768
          xlarge: `${baseSpacing * 48}px`, // 1152
          xxlarge: `${baseSpacing * 64}px`, // 1536
          full: '100%',
        },
        breakpoints: {
          small: {
            value: baseSpacing * 32, // 768
            borderSize: {
              xsmall: '1px',
              small: '2px',
              medium: `${borderSize / 6}px`, // 4
              large: `${borderSize / 4}px`, // 6
              xlarge: `${borderSize / 2}px`, // 12
            },
            edgeSize: {
              none: '0px',
              hair: '1px', // for Chart
              xxsmall: '2px',
              xsmall: `${baseSpacing / 8}px`, // 3
              small: `${baseSpacing / 4}px`, // 6
              medium: `${baseSpacing / 2}px`, // 12
              large: `${baseSpacing}px`, // 24
              xlarge: `${baseSpacing * 2}px`, // 48
            },
            size: {
              xxsmall: `${baseSpacing}px`, // 24
              xsmall: `${baseSpacing * 2}px`, // 48
              small: `${baseSpacing * 4}px`, // 96
              medium: `${baseSpacing * 8}px`, // 192
              large: `${baseSpacing * 16}px`, // 384
              xlarge: `${baseSpacing * 32}px`, // 768
              full: '100%',
            },
          },
          medium: {
            value: baseSpacing * 64, // 1536
          },
          large: {}, // anything above 'medium'
        },
      }
    };

    this.setState(mergeDeepLeft(data, this.state));
  }

  private choosefont({ type, family }) {
    const sect = {
      "headline": "heading",
      "body": "global",
    };
    const newState = mergeDeepLeft({
      [sect[type]]: {
        font: {
          family
        }
      }
    }, this.state);
    this.setState(newState);
  }

  private pickPicker(event) {
    this.setState({
      picking: event.target.value
    });
  }

  private setThemetitle(themetitle) {
    this.setState({
      themetitle
    });
  }

  private setClient(_client) {
    this.setState({
      _client
    });
  }

  private saveTheme() {
    if(this.saving) return; // Only safe one at a time
    // // TODO: Actually put all of this into state and do propper form-management!
    this.saving = true;
    const prom = fetch(`https://zcmsapi.herokuapp.com/api/v1/theme`, {
      method: "POST",
      cache: "no-cache",
      headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${auth.getIdToken()}`
      },
      body: JSON.stringify({
        global: this.state.global,
        heading: this.state.heading,
        paragraph: this.state.paragraph,
        text: this.state.text,
        anchor: this.state.anchor,
        palette: this.state.palette,
        shapes: this.state.shapes,
        _client: this.state._client,
        title: this.state.themetitle,
      })
    }).then(i => Promise.all([ i, i.json() ]).then(([a, b]) => ({
      ...a,
      data: b,
    })));
    prom.then(() => { this.saving = false; });
    prom.then((i) => {
      navigate(
        "/admin",
        {
          state: i,
        }
      );
    });
  }

  public render() {

    const onSubmit = () => null;
    const onError = () => null;

    const setPalette = () => {
      let palette;
      let shapes1;
      if(this.state.precomputed.length) {
        console.log("Using pre-generated");
        const [pre, ...other] = this.state.precomputed;
        shapes1 = pre.shapes;
        palette = pre.palette;
        this.setState({
          precomputed: other
        });
        if(other.length < 4) {
          worker1.postMessage({
            op: "generate",
          });
          worker2.postMessage({
            op: "generate",
          });
          worker3.postMessage({
            op: "generate",
          });
          worker4.postMessage({
            op: "generate",
          });
        }
      } else {
        console.log("Generate from scratch");
        const tmp = distinctColors({
          count: 9,
          samples: Math.random()*10e2+500,
          quality: Math.random()*75+25,
        });
        palette = tmp.map(i => [i, Math.random()]).sort(([, a], [, b]) => a - b).map(([i]) => i);
        shapes1 = palette.map(i => chroma.scale(['black', i.hex(), 'white']).mode('lrgb').colors(13).slice(1, -1));
      }

      // const shapes2 = shapes1.map(j => j.map(i => chroma(i).saturate().hex()));
      // const shapes3 = shapes1.map(j => j.map(i => chroma(i).desaturate().hex()));
      // const shapes4 = shapes1.map(j => j.map(i => chroma(i).darken().hex()));
      // const shapes5 = shapes1.map(j => j.map(i => chroma(i).brighten().hex()));
      const empty = shapes1.map(j => j.map(() => "#FFF"));

      worker1.postMessage({
        scale: shapes1,
        op: "saturate",
        pos: 1,
      });
      worker2.postMessage({
        scale: shapes1,
        op: "desaturate",
        pos: 2,
      });
      worker3.postMessage({
        scale: shapes1,
        op: "darken",
        pos: 3,
      });
      worker4.postMessage({
        scale: shapes1,
        op: "brighten",
        pos: 4,
      });

      const brand = palette.shift();
      this.setState(mergeDeepLeft({
        brand,
        global: { colors: { brand } },
        palette: palette,
        shapes: [shapes1, empty, empty, empty, empty]
      }, this.state));
    }
    /*
    fetch("http://colormind.io/api/", { method: "POST", body: JSON.stringify({
    	model : "default",
    	input : [[44,43,44],"N","N","N","N"]
    }) })
    */

    // <NewTheme schema={themeschema} onSubmit={onSubmit} onError={onError} />
    // <NewTheme context={this.state} schema={themeschema} onSubmit={onSubmit} onError={onError} />

    const Radio = ({ value, ...rest }) => <Box
      background={this.state?.global?.colors?.[value] || 'transparent'}
      width="25%"
      pad="small"
    ><StyledRadioButton
      checked={this.state.picking === value}
      label={value}
      value={value}
      onChange={this.pickPicker}
      {...rest}
    /></Box>;

    const Group = function({ children, currentStep, totalSteps, nextStep, previousStep, final }) {
      return <Grid
        rows={['auto', 'auto', 'auto']}
        columns={['auto', 'flex', 'auto']}
        fill={true}
        areas={[
          { name: 'headline', start: [0, 0], end: [2, 0] },
          { name: 'content', start: [0, 1], end: [2, 1] },
          { name: 'prev', start: [0, 2], end: [0, 2] },
          { name: 'next', start: [2, 2], end: [2, 2] },
        ]}
      >
        {children}
        <Button onClick={previousStep} disabled={currentStep === 1} gridArea="prev" label="Back"/>
        {!final && currentStep !== totalSteps && <Button onClick={nextStep} gridArea="next" label="Next"/>}
      </Grid>;
    };

    return (
      <Grid
        rows={['auto', 'auto', 'auto', 'auto']}
        columns={['auto', 'flex', 'auto']}
        fill={true}
        areas={[
          { name: 'user', start: [2, 0], end: [2, 0] },
          { name: 'auth', start: [2, 1], end: [2, 1] },
          { name: 'headline', start: [0, 0], end: [1, 1] },
          { name: 'content', start: [0, 2], end: [2, 2] },
          { name: 'submit', start: [0, 3], end: [2, 3] },
        ]}
      >
        <Authentication auth={auth} />
        <StyledStepWizard isLazyMount>
          <Group>
            <Heading level={2} gridArea="headline">Color creator</Heading>
            <Box fill gridArea="content">
              <Colors Radio={Radio} setPalette={setPalette} choose={this.choose} brand={this.state.brand} shapes={this.state.shapes} palette={this.state.palette} inTheme={this.inTheme} grayscale={this.state.grayscale} />
            </Box>
          </Group>
          <Group>
            <Heading level={2} gridArea="headline">Font creator</Heading>
            <Box justify="center" gridArea="content">
              <FontChooser onChange={this.choosefont} bodyfont={this.state?.global?.font?.family} headlinefont={this.state?.heading?.font?.family} />
            </Box>
          </Group>
          <Group>
            <Heading level={2} gridArea="headline">Sizing creator</Heading>
            <Box gridArea="content" pad={{ horizontal: "large" }} justify="center">
              <CheckBox
                checked={this.state?.anchor?.textDecoration === "underline"}
                label="Underline links?"
                onChange={(event) => this.setLinkUnderline(event.target.checked)}
              />
              <CheckBox
                checked={this.state?.anchor?.hover?.textDecoration === "underline"}
                label="Underline links on hover?"
                onChange={(event) => this.setLinkHoverUnderline(event.target.checked)}
              />
              <Box width="large" >
                <FormField label="Choose the base size of your font (default = 4)">
                  <RangeInput
                    max={6}
                    min={1}
                    step={0.1}
                    value={this.state.fontScale}
                    onChange={event => this.setFontScale(event.target.value)}
                  />
                </FormField>
                <FormField label="Choose the density of your layout (default = 4)">
                  <RangeInput
                    max={6}
                    min={1}
                    step={0.1}
                    value={this.state.density}
                    onChange={event => this.setDensity(event.target.value)}
                  />
                </FormField>
              </Box>
              <Grommet
                theme={this.state}
              >
                <Box direction="row"  margin="small" pad="small">
                  <Box as="section" margin="small" border={{ color: 'accent-1', size: 'large' }} round="medium" pad="large" background="light1">
                    <Heading level={1}>Level 1</Heading>
                    <Paragraph>
                      Working. I'm sure that in 1985, plutonium is available at every corner drug store, but in 1955, it's a little hard to come by.
                      Marty, I'm sorry, but I'm afraid you're stuck here. My god, do you know what this means?
                      It means that this damn thing doesn't work at all. Oh, uh, this is my Doc, Uncle, Brown.
                      A block passed Maple, that's John F. Kennedy Drive. Precisely. Doc.
                    </Paragraph>
                    <Anchor label="Example Link" href="#" />
                  </Box>
                  <Box as="section" width="large" margin="small" border={{ color: 'accent-2', size: 'large' }} round="medium" pad="large" background="light2">
                    <Heading level={2}>Level 2</Heading>
                    <Distribution
                      fill
                      gap="small"
                      values={[
                        { value: 50, color: '4' },
                        { value: 30, color: '2' },
                        { value: 20, color: '3' },
                        { value: 20, color: '1' }
                      ]}
                    >
                      {value => (
                        <Box pad="small" background={`dark${value.color}`} fill />
                      )}
                    </Distribution>
                    <hr />
                    <Button label="Example Link" href="#" />
                  </Box>
                </Box>
              </Grommet>
            </Box>
          </Group>
          <Group final>
            <Heading level={2} gridArea="headline">Review and save</Heading>
            <Box gridArea="content" justify="center">
              <pre>{JSON.stringify({
                global: this.state.global,
                heading: this.state.heading,
                paragraph: this.state.paragraph,
                text: this.state.text,
                anchor: this.state.anchor,
              }, null, "\t")}</pre>
              <hr/>
              <FormField label="Briefly describe the theme">
                <TextInput
                  placeholder="Title"
                  value={this.state.themetitle}
                  onChange={event => this.setThemetitle(event.target.value)}
                />
              </FormField>
              <FormField label="The client this theme belongs to">
                <TextInput
                  placeholder="_client"
                  value={this.state._client}
                  onChange={event => this.setClient(event.target.value)}
                />
              </FormField>
              <hr/>
              <Button disabled={!this.state?._client || !this.state?.themetitle} label="Save" onClick={this.saveTheme} />
            </Box>
          </Group>
        </StyledStepWizard>
      </Grid>
    );
  }
}
